'use client'

import {
  CurrencyDollarIcon,
  NoSymbolIcon,
  PhoneIcon,
  SpeakerWaveIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface OutcomeButtonsProps {
  onSelectOutcome: (outcome: string) => void;
}

export default function OutcomeButtons({ onSelectOutcome }: OutcomeButtonsProps) {
  const outcomes = [
    {
      id: 'donated',
      label: 'Donated',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Donor made a contribution'
    },
    {
      id: 'callback',
      label: 'Call Back',
      icon: PhoneIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Schedule a follow-up call'
    },
    {
      id: 'not_interested',
      label: 'Not Interested',
      icon: XMarkIcon,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Donor declined to contribute'
    },
    {
      id: 'no_answer',
      label: 'No Answer',
      icon: NoSymbolIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'No one answered the call'
    },
    {
      id: 'voicemail',
      label: 'Voicemail',
      icon: SpeakerWaveIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Left a voicemail message'
    }
  ]

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Call Outcome</h3>

      <div className="space-y-3">
        {outcomes.map((outcome) => {
          const IconComponent = outcome.icon
          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onSelectOutcome(outcome.id)}
              className={`w-full p-4 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${outcome.color}`}
            >
              <div className="flex items-center justify-center space-x-3">
                <IconComponent className="w-5 h-5" />
                <span>{outcome.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          Select the outcome of your call to record it and move to the next donor
        </p>
      </div>
    </div>
  )
}