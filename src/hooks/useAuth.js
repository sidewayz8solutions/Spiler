import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/Providers'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Zustand store for auth state
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      organization: null,
      teamMember: null,
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setTeamMember: (teamMember) => set({ teamMember }),
      reset: () => set({ user: null, organization: null, teamMember: null })
    }),
    {
      name: 'spiler-auth'
    }
  )
)

export function useAuth() {
  const supabase = useSupabase()
  const { user, organization, teamMember, setUser, setOrganization, setTeamMember, reset } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUser()
        } else {
          reset()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Load team member and organization
        const { data: teamMemberData } = await supabase
          .from('team_members')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id)
          .single()
        
        if (teamMemberData) {
          setTeamMember(teamMemberData)
          setOrganization(teamMemberData.organization)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  return {
    user,
    organization,
    teamMember,
    loading,
    signIn,
    signUp,
    signOut
  }
}
