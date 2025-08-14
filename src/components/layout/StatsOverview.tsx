'use client'

import { 
  PhoneIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

export default function StatsOverview({ stats }) {
  const statCards = [
    {
      label: 'Total Calls',
      value: stats?.totalCalls || 0,
      icon: PhoneIcon,
      color: 'from-blue-500 to-indigo-600',
      change: '+12%'
    },
    {
      label: 'Total Raised',
      value: `$${(stats?.totalRaised || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-emerald-600',
      change: '+23%'
    },
    {
      label: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-600',
      change: '+5%'
    },
    {
      label: 'Queue Size',
      value: stats?.queueSize || 0,
      icon: UserGroupIcon,
      color: 'from-orange-500 to-red-600',
      change: '45 remaining'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="card hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-400 mt-2">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}