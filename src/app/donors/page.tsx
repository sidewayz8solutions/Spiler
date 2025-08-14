'use client'

import Navigation from '@/components/layout/Navigation'
import { useDonorStore } from '@/stores/donorStore'

export default function DonorsPage() {
  const { donors, getFilteredDonors } = useDonorStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-8">Donor Management</h1>
        {/* Add donor management UI here */}
      </main>
    </div>
  )
}