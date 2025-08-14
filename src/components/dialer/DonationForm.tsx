'use client'

import { useState } from 'react';

import {
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function DonationForm({ donor, onSubmit, onCancel }) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(parseFloat(amount), notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Record Donation</h3>
              <p className="text-sm text-gray-400">{donor?.full_name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close donation form"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Donation Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Any additional notes about the donation..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? 'Recording...' : 'Record Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}