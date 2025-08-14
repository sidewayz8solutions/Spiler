'use client'

import {
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import CallControls from '../../components/dialer/CallControls';
import CallTimer from '../../components/dialer/CallTimer';
import DonationForm from '../../components/dialer/DonationForm';
import DonorCard from '../../components/dialer/DonorCard';
import OutcomeButtons from '../../components/dialer/OutcomeButtons';
import ScriptDisplay from '../../components/dialer/ScriptDisplay';
import Navigation from '../../components/layout/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { useDialer } from '../../hooks/useDialer';
import { useRealtimeQueue } from '../../hooks/useRealtime';

export default function DialerPage() {
  const { user, organization } = useAuth()
  const { queue } = useRealtimeQueue(organization?.id)
  const {
    currentDonor,
    isCallActive,
    callDuration,
    loadNextDonor,
    startCall,
    endCall,
    recordOutcome
  } = useDialer()

  const [showDonationForm, setShowDonationForm] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState(null)

  useEffect(() => {
    // Load first donor when component mounts
    if (!currentDonor && queue.length > 0) {
      loadNextDonor()
    }
  }, [queue])

  const handleStartCall = async () => {
    if (!currentDonor) {
      toast.error('No donor loaded')
      return
    }

    // Initiate call via phone's dialer
    window.location.href = `tel:${currentDonor.phone}`
    
    // Start call tracking
    await startCall(currentDonor.id)
    toast.success(`Calling ${currentDonor.full_name}`)
  }

  const handleOutcome = async (outcome) => {
    setSelectedOutcome(outcome)
    
    if (outcome === 'donated') {
      setShowDonationForm(true)
    } else {
      await recordOutcome(outcome)
      await loadNextDonor()
      toast.success('Call recorded')
    }
  }

  const handleDonationSubmit = async (amount, notes) => {
    await recordOutcome('donated', amount, notes)
    setShowDonationForm(false)
    await loadNextDonor()
    toast.success(`Donation of $${amount} recorded! 🎉`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Dialer</h1>
            <p className="text-gray-400">
              {queue.length} donors in queue
            </p>
          </div>
          
          {/* Queue Progress */}
          <div className="w-64">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round((1 - queue.length / 100) * 100)}%</span>
            </div>
            <div className="h-2 bg-spiler-dark rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                style={{ width: `${Math.round((1 - queue.length / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Donor Info & Script */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Donor */}
            {currentDonor ? (
              <DonorCard donor={currentDonor} />
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-400 mb-4">No donor loaded</p>
                <button
                  onClick={loadNextDonor}
                  className="btn btn-primary"
                >
                  Load Next Donor
                </button>
              </div>
            )}

            {/* AI Script */}
            {currentDonor && (
              <ScriptDisplay donor={currentDonor} />
            )}
          </div>

          {/* Right Column - Call Controls */}
          <div className="space-y-6">
            {/* Call Timer */}
            {isCallActive && (
              <CallTimer duration={callDuration} />
            )}

            {/* Call Controls */}
            {!isCallActive ? (
              <CallControls 
                onStartCall={handleStartCall}
                onSkip={loadNextDonor}
                disabled={!currentDonor}
              />
            ) : (
              <OutcomeButtons 
                onSelectOutcome={handleOutcome}
              />
            )}

            {/* Notes */}
            <div className="card">
              <h3 className="font-semibold mb-3">Call Notes</h3>
              <textarea
                id="callNotes"
                className="input min-h-[100px] resize-none"
                placeholder="Enter any notes from the call..."
              />
            </div>
          </div>
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <DonationForm
            donor={currentDonor}
            onSubmit={handleDonationSubmit}
            onCancel={() => setShowDonationForm(false)}
          />
        )}
      </main>
    </div>
  )
}