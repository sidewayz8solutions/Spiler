'use client'

import {
  useEffect,
  useState,
} from 'react';

import { generateScript } from '@/lib/ai/scriptGenerator';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ScriptDisplay({ donor }) {
  const [script, setScript] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('opening')

  useEffect(() => {
    // Generate personalized script based on donor data
    const generatedScript = generateScript(donor)
    setScript(generatedScript)
  }, [donor])

  if (!script) return null

  const sections = [
    { id: 'opening', label: 'Opening', content: script.opening },
    { id: 'pitch', label: 'Pitch', content: script.pitch },
    { id: 'ask', label: 'Ask', content: script.ask },
    { id: 'objections', label: 'Objections', content: script.objections },
    { id: 'closing', label: 'Closing', content: script.closing }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Script Assistant</h3>
        <SparklesIcon className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeSection === section.id
                ? 'bg-indigo-500 text-white'
                : 'bg-spiler-dark/50 text-gray-400 hover:text-white'
              }
            `}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Script Content */}
      <div className="bg-spiler-dark/30 rounded-lg p-4">
        {sections.map(section => (
          <div
            key={section.id}
            className={activeSection === section.id ? 'block' : 'hidden'}
          >
            {section.id === 'objections' ? (
              <div className="space-y-3">
                {Object.entries(section.content).map(([objection, response]) => (
                  <div key={objection}>
                    <p className="text-sm text-red-400 mb-1">"{objection}"</p>
                    <p className="text-sm pl-4 border-l-2 border-indigo-500">
                      {response as string}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{section.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <p className="text-xs text-indigo-400 font-semibold mb-1">💡 Quick Tip:</p>
        <p className="text-xs text-gray-300">
          {donor.previous_donation_amount > 0
            ? "Reference their previous support early in the conversation"
            : "Focus on the impact their first donation will make"
          }
        </p>
      </div>
    </div>
  )
}