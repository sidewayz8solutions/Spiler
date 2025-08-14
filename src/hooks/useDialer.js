import { create } from 'zustand'
import { useSupabase } from '@/components/providers/Providers'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

// Zustand store for dialer state
const useDialerStore = create((set, get) => ({
  currentDonor: null,
  currentCall: null,
  isCallActive: false,
  callStartTime: null,
  callDuration: 0,
  queue: [],
  
  setCurrentDonor: (donor) => set({ currentDonor: donor }),
  setCurrentCall: (call) => set({ currentCall: call }),
  setCallActive: (active) => set({ isCallActive: active }),
  setCallStartTime: (time) => set({ callStartTime: time }),
  setCallDuration: (duration) => set({ callDuration: duration }),
  setQueue: (queue) => set({ queue }),
  
  reset: () => set({
    currentDonor: null,
    currentCall: null,
    isCallActive: false,
    callStartTime: null,
    callDuration: 0
  })
}))

export function useDialer() {
  const supabase = useSupabase()
  const { organization, teamMember } = useAuth()
  const {
    currentDonor,
    currentCall,
    isCallActive,
    callDuration,
    queue,
    setCurrentDonor,
    setCurrentCall,
    setCallActive,
    setCallStartTime,
    setCallDuration,
    setQueue,
    reset
  } = useDialerStore()

  // Load next donor from queue
  async function loadNextDonor() {
    try {
      // Get next donor from queue using RPC function
      const { data, error } = await supabase.rpc('get_next_donor', {
        org_id: organization.id,
        member_id: teamMember.id
      })

      if (error) throw error

      if (data && data.length > 0) {
        const nextDonor = data[0]
        
        // Load full donor data
        const { data: donorData } = await supabase
          .from('donors')
          .select('*')
          .eq('id', nextDonor.donor_id)
          .single()

        if (donorData) {
          setCurrentDonor(donorData)
          return donorData
        }
      } else {
        toast.error('No more donors in queue')
        setCurrentDonor(null)
      }
    } catch (error) {
      console.error('Error loading next donor:', error)
      toast.error('Failed to load next donor')
    }
  }

  // Start a call
  async function startCall(donorId) {
    try {
      // Create call record
      const { data: call, error } = await supabase
        .from('calls')
        .insert({
          organization_id: organization.id,
          donor_id: donorId,
          team_member_id: teamMember.id,
          phone_number: currentDonor.phone,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setCurrentCall(call)
      setCallActive(true)
      setCallStartTime(Date.now())

      // Start duration timer
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - Date.now()) / 1000)
        setCallDuration(duration)
      }, 1000)

      // Store timer ID for cleanup
      window.callTimer = timer

      return call
    } catch (error) {
      console.error('Error starting call:', error)
      toast.error('Failed to start call')
    }
  }

  // End call and record outcome
  async function endCall() {
    if (window.callTimer) {
      clearInterval(window.callTimer)
    }

    const duration = Math.floor((Date.now() - get().callStartTime) / 1000)

    try {
      // Update call record
      const { error } = await supabase
        .from('calls')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          status: 'completed'
        })
        .eq('id', currentCall.id)

      if (error) throw error

      setCallActive(false)
      setCallDuration(0)
    } catch (error) {
      console.error('Error ending call:', error)
    }
  }

  // Record call outcome
  async function recordOutcome(outcome, donationAmount = null, notes = '') {
    try {
      // Update call with outcome
      const { error: callError } = await supabase
        .from('calls')
        .update({
          outcome,
          donation_amount: donationAmount,
          notes,
          ended_at: new Date().toISOString(),
          duration_seconds: callDuration
        })
        .eq('id', currentCall.id)

      if (callError) throw callError

      // Update donor status
      const { error: donorError } = await supabase
        .from('donors')
        .update({
          status: outcome === 'donated' ? 'donated' : outcome,
          last_contact_date: new Date().toISOString(),
          notes: notes ? `${currentDonor.notes || ''}\n\n${new Date().toLocaleDateString()}: ${notes}` : currentDonor.notes
        })
        .eq('id', currentDonor.id)

      if (donorError) throw donorError

      // If donated, create donation record
      if (outcome === 'donated' && donationAmount) {
        const { error: donationError } = await supabase
          .from('donations')
          .insert({
            organization_id: organization.id,
            donor_id: currentDonor.id,
            call_id: currentCall.id,
            amount: donationAmount,
            payment_status: 'pending',
            notes
          })

        if (donationError) throw donationError
      }

      // Update queue status
      await supabase
        .from('call_queue')
        .update({ status: 'completed' })
        .eq('donor_id', currentDonor.id)
        .eq('organization_id', organization.id)

      // Reset call state
      setCallActive(false)
      setCurrentCall(null)
      setCallDuration(0)

      return true
    } catch (error) {
      console.error('Error recording outcome:', error)
      toast.error('Failed to record outcome')
      return false
    }
  }

  return {
    currentDonor,
    currentCall,
    isCallActive,
    callDuration,
    queue,
    loadNextDonor,
    startCall,
    endCall,
    recordOutcome
  }
}
