'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/Providers'
import { formatDistanceToNow } from 'date-fns'

export default function RecentActivity({ organizationId }) {
  const supabase = useSupabase()
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (!organizationId) return

    loadRecentActivity()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`activity-${organizationId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'calls' },
        (payload) => {
          setActivities(prev => [{
            type: 'call',
            message: 'New call started',
            time: payload.new.created_at,
            ...payload.new
          }, ...prev].slice(0, 10))
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          setActivities(prev => [{
            type: 'donation',
            message: `Donation received: $${payload.new.amount}`,
            time: payload.new.created_at,
            ...payload.new
          }, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, supabase])

  async function loadRecentActivity() {
    // Load recent calls and donations
    const { data: calls } = await supabase
      .from('calls')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Combine and sort
    const combined = [
      ...(calls || []).map(c => ({ ...c, type: 'call', message: 'Call completed' })),
      ...(donations || []).map(d => ({ ...d, type: 'donation', message: `Donation: $${d.amount}` }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)

    setActivities(combined)
  }

  return (
    <div className="card h-full">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className={`
                w-2 h-2 rounded-full mt-2
                ${activity.type === 'donation' ? 'bg-green-500' : 'bg-blue-500'}
              `} />
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.created_at || activity.time), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
