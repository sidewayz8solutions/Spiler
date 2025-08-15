'use client'

import {
  useEffect,
  useState,
} from 'react';

import { formatDistanceToNow } from 'date-fns';

import { useSupabase } from '@/components/providers/Providers';

// Type definitions
interface CallRecord {
  id: string
  organization_id: string
  donor_id: string
  team_member_id: string
  phone_number: string
  status: string
  started_at: string
  created_at: string
  [key: string]: any
}

interface DonationRecord {
  id: string
  organization_id: string
  donor_id: string
  amount: number
  created_at: string
  [key: string]: any
}

interface Activity {
  type: 'call' | 'donation'
  message: string
  time?: string
  created_at?: string
  [key: string]: any
}

interface RealtimePayload {
  new: CallRecord | DonationRecord
  old?: CallRecord | DonationRecord
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

interface RecentActivityProps {
  organizationId: string
}

export default function RecentActivity({ organizationId }: RecentActivityProps) {
  const supabase = useSupabase() as any // Type assertion to work around typing issues
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!organizationId) return

    loadRecentActivity()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`activity-${organizationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls' },
        (payload: RealtimePayload) => {
          const newActivity: Activity = {
            ...payload.new,
            type: 'call',
            message: 'New call started',
            time: payload.new.created_at
          }
          setActivities(prev => [newActivity, ...prev].slice(0, 10))
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload: RealtimePayload) => {
          const donationData = payload.new as DonationRecord
          const newActivity: Activity = {
            ...payload.new,
            type: 'donation',
            message: `Donation received: $${donationData.amount}`,
            time: payload.new.created_at
          }
          setActivities(prev => [newActivity, ...prev].slice(0, 10))
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
    const combined: Activity[] = [
      ...(calls || []).map((c: CallRecord): Activity => ({ ...c, type: 'call', message: 'Call completed' })),
      ...(donations || []).map((d: DonationRecord): Activity => ({ ...d, type: 'donation', message: `Donation: $${d.amount}` }))
    ].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).slice(0, 10)

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
                  {formatDistanceToNow(new Date(activity.created_at || activity.time || ''), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
