'use client'

import { PhoneIcon, EnvelopeIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function DonorCard({ donor }) {
  const getDonorBadge = () => {
    if (donor.previous_donation_amount > 1000) return { text: 'Major Donor', color: 'bg-yellow-500' }
    if (donor.previous_donation_amount > 500) return { text: 'High Value', color: 'bg-purple-500' }
    if (donor.previous_donation_amount > 0) return { text: 'Previous Donor', color: 'bg-green-500' }
    return { text: 'New Prospect', color: 'bg-blue-500' }
  }

  const badge = getDonorBadge()

  return (
    <div className="card gradient-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {donor.full_name}
            <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
              {badge.text}
            </span>
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center text-gray-400">
              <PhoneIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">{donor.phone}</span>
            </div>
            {donor.email && (
              <div className="flex items-center text-gray-400">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{donor.email}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">Score</p>
          <p className="text-2xl font-bold text-gradient">{donor.score || 50}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-indigo-500/20">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Previous Donation</p>
          <p className="text-lg font-semibold">
            ${donor.previous_donation_amount || 0}
          </p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Donated</p>
          <p className="text-lg font-semibold">
            ${donor.total_donated || 0}
          </p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Last Contact</p>
          <p className="text-lg font-semibold">
            {donor.last_contact_date 
              ? new Date(donor.last_contact_date).toLocaleDateString()
              : 'Never'
            }
          </p>
        </div>
      </div>

      {donor.notes && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">Previous Notes:</p>
          <p className="text-sm mt-1">{donor.notes}</p>
        </div>
      )}
    </div>
  )
}