'use client'

import { useRouter } from 'next/navigation'
import { 
  PhoneIcon, 
  PlusIcon, 
  DocumentArrowUpIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Start Dialing',
      description: 'Begin making calls to donors',
      icon: PhoneIcon,
      onClick: () => router.push('/dialer'),
      color: 'from-indigo-500 to-purple-600'
    },
    {
      label: 'Add Donors',
      description: 'Import new donor list',
      icon: PlusIcon,
      onClick: () => router.push('/donors?action=import'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'View Queue',
      description: 'Manage your call queue',
      icon: ClipboardDocumentListIcon,
      onClick: () => router.push('/queue'),
      color: 'from-orange-500 to-red-600'
    },
    {
      label: 'Export Report',
      description: 'Download campaign results',
      icon: DocumentArrowUpIcon,
      onClick: () => router.push('/analytics?export=true'),
      color: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="p-4 rounded-xl bg-spiler-dark/50 hover:bg-spiler-dark border border-indigo-500/10 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
