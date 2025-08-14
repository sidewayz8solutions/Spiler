'use client'

import { useEffect, useState } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function CallTimer({ duration }) {
  const [time, setTime] = useState(duration || 0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card bg-green-500/10 border-green-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <ClockIcon className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Call Duration</p>
            <p className="text-2xl font-bold font-mono text-green-400">
              {formatTime(time)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-400">Active</span>
        </div>
      </div>
    </div>
  )
}