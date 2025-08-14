'use client'

import { PhoneIcon, ForwardIcon } from '@heroicons/react/24/solid'

export default function CallControls({ onStartCall, onSkip, disabled }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Call Controls</h3>
      
      <div className="space-y-3">
        <button
          onClick={onStartCall}
          disabled={disabled}
          className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhoneIcon className="w-6 h-6 mr-2" />
          Start Call
        </button>

        <button
          onClick={onSkip}
          disabled={disabled}
          className="w-full btn btn-secondary py-3"
        >
          <ForwardIcon className="w-5 h-5 mr-2" />
          Skip to Next
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          Clicking "Start Call" will open your phone's dialer with the donor's number
        </p>
      </div>
    </div>
  )
}