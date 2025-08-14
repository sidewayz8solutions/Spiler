'use client'

import Navigation from '@/components/layout/Navigation'
import { useRealtimeQueue } from '@/hooks/useRealtime'
import { useAuth } from '@/hooks/useAuth'

export default function QueuePage() {
  const { organization } = useAuth()
  const { queue } = useRealtimeQueue(organization?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-8">Queue Management</h1>
        {/* Add queue management UI here */}
      </main>
    </div>
  )
}