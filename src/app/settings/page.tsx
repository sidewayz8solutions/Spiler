'use client'

import { useState } from 'react';

import { formatCurrency } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

import Navigation from '../../components/layout/Navigation';
import { useAuth } from '../../hooks/useAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const { user, organization } = useAuth()
  const [settings, setSettings] = useState({
    notifications: true,
    autoDialer: false,
    callRecording: true,
    theme: 'dark'
  })
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  type Analytics = {
    overview: {
      totalCalls: number
      totalDonations: number
      totalRaised: number
      avgDonation: number
      conversionRate: number
      avgCallDuration: number
      growthRate: number
      dollarsPerCall: number
    }
    dailyStats: { date: string; amount: number; count: number }[]
    topPerformers: { name: string; calls: number; donations: number; raised: number }[]
    outcomeDistribution: { name: string; value: number; color: string }[]
    hourlyPerformance: { hour: string; calls: number; conversions: number; conversionRate: number }[]
    donorSegments: { name: string; value: number; color: string }[]
    campaignComparison: { name: string; raised: number; donations: number }[]
  }

  const [analytics, setAnalytics] = useState<Analytics>({
    overview: {
      totalCalls: 0,
      totalDonations: 0,
      totalRaised: 0,
      avgDonation: 0,
      conversionRate: 0,
      avgCallDuration: 0,
      growthRate: 0,
      dollarsPerCall: 0
    },
    dailyStats: [],
    topPerformers: [],
    outcomeDistribution: [],
    hourlyPerformance: [],
    donorSegments: [],
    campaignComparison: []
  })

  // All analytics-related functions are now inside the component
  async function loadAnalytics() {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch(timeRange) {
        case '24h': startDate.setDate(startDate.getDate() - 1); break
        case '7d': startDate.setDate(startDate.getDate() - 7); break
        case '30d': startDate.setDate(startDate.getDate() - 30); break
        case '90d': startDate.setDate(startDate.getDate() - 90); break
      }

      // Load all analytics data in parallel
      const [
        overviewData,
        dailyData,
        performersData,
        outcomesData,
        hourlyData,
        segmentsData,
        campaignsData
      ] = await Promise.all([
        loadOverviewStats(startDate, endDate),
        loadDailyStats(startDate, endDate),
        loadTopPerformers(startDate, endDate),
        loadOutcomeDistribution(startDate, endDate),
        loadHourlyPerformance(startDate, endDate),
        loadDonorSegments(),
        loadCampaignComparison(startDate, endDate)
      ])

      setAnalytics({
        overview: overviewData,
        dailyStats: dailyData,
        topPerformers: performersData,
        outcomeDistribution: outcomesData,
        hourlyPerformance: hourlyData,
        donorSegments: segmentsData,
        campaignComparison: campaignsData
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadOverviewStats(startDate, endDate) {
    // Get calls
    const { data: calls } = await supabase
      .from('calls')
      .select('*')
      .eq('organization_id', organization.id)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Get donations
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('organization_id', organization.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate metrics
    const totalCalls = calls?.length || 0
    const totalDonations = donations?.length || 0
    const totalRaised = donations?.reduce((sum, d) => sum + d.amount, 0) || 0
    const avgDonation = totalDonations > 0 ? totalRaised / totalDonations : 0
    const conversionRate = totalCalls > 0 ? (totalDonations / totalCalls) * 100 : 0
    const avgCallDuration = calls?.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls || 0

    // Calculate previous period for comparison
    const prevEndDate = new Date(startDate)
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24))

    const { data: prevDonations } = await supabase
      .from('donations')
      .select('amount')
      .eq('organization_id', organization.id)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', prevEndDate.toISOString())

    const prevRaised = prevDonations?.reduce((sum, d) => sum + d.amount, 0) || 0
    const growthRate = prevRaised > 0 ? ((totalRaised - prevRaised) / prevRaised) * 100 : 0

    return {
      totalCalls,
      totalDonations,
      totalRaised,
      avgDonation,
      conversionRate,
      avgCallDuration,
      growthRate,
      dollarsPerCall: totalCalls > 0 ? totalRaised / totalCalls : 0
    }
  }

  async function loadDailyStats(
    startDate: Date,
    endDate: Date
  ): Promise<{ date: string; amount: number; count: number }[]> {
    const { data } = await supabase
      .from('donations')
      .select('amount, created_at')
      .eq('organization_id', organization.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at')

    // Group by day
    const dailyMap: { [key: string]: { date: string; amount: number; count: number } } = {}
    data?.forEach((donation: { created_at: string; amount: number }) => {
      const day = new Date(donation.created_at).toLocaleDateString()
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, amount: 0, count: 0 }
      }
      dailyMap[day].amount += donation.amount
      dailyMap[day].count += 1
    })

    return Object.values(dailyMap)
  }

  async function loadTopPerformers(startDate, endDate) {
    const { data } = await supabase
      .from('calls')
      .select(`
        caller_id,
        organization_members!inner(full_name),
        donations(amount)
      `)
      .eq('organization_id', organization.id)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Aggregate by caller
    const performerMap = {}
    data?.forEach(call => {
      const callerId = call.caller_id
      if (!performerMap[callerId]) {
        performerMap[callerId] = {
          name: Array.isArray(call.organization_members) && call.organization_members.length > 0
            ? call.organization_members[0].full_name
            : 'Unknown',
          calls: 0,
          donations: 0,
          raised: 0
        }
      }
      performerMap[callerId].calls += 1
      if (call.donations?.length > 0) {
        performerMap[callerId].donations += 1
        performerMap[callerId].raised += call.donations[0].amount
      }
    })

    return (Object.values(performerMap) as {
      name: string;
      calls: number;
      donations: number;
      raised: number;
    }[])
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 10)
  }

  async function loadOutcomeDistribution(startDate, endDate) {
    const { data } = await supabase
      .from('calls')
      .select('outcome')
      .eq('organization_id', organization.id)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Count outcomes
    const outcomeMap = {}
    data?.forEach(call => {
      const outcome = call.outcome || 'no_answer'
      outcomeMap[outcome] = (outcomeMap[outcome] || 0) + 1
    })

    const colors = {
      donated: '#10b981',
      callback: '#f59e0b',
      not_interested: '#ef4444',
      no_answer: '#6b7280',
      voicemail: '#8b5cf6'
    }

    return Object.entries(outcomeMap).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Number(value),
      color: colors[name] || '#6366f1'
    }))
  }

  async function loadHourlyPerformance(startDate, endDate) {
    const { data } = await supabase
      .from('calls')
      .select('started_at, outcome')
      .eq('organization_id', organization.id)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    // Group by hour
    const hourlyMap: { [key: number]: { hour: number; calls: number; conversions: number } } = {}
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = { hour: i, calls: 0, conversions: 0 }
    }

    data?.forEach(call => {
      const hour = new Date(call.started_at).getHours()
      hourlyMap[hour].calls += 1
      if (call.outcome === 'donated') {
        hourlyMap[hour].conversions += 1
      }
    })

    return Object.values(hourlyMap).map(h => ({
      ...h,
      conversionRate: h.calls > 0 ? (h.conversions / h.calls) * 100 : 0,
      hour: `${h.hour}:00`
    }))
  }

  async function loadDonorSegments() {
    const { data } = await supabase
      .from('donors')
      .select('previous_donation_amount')
      .eq('organization_id', organization.id)

    const segments = {
      'New Prospects': 0,
      'Small Donors': 0,
      'Mid-Level': 0,
      'Major Donors': 0,
      'VIP': 0
    }

    data?.forEach(donor => {
      const amount = donor.previous_donation_amount || 0
      if (amount === 0) segments['New Prospects'] += 1
      else if (amount < 100) segments['Small Donors'] += 1
      else if (amount < 500) segments['Mid-Level'] += 1
      else if (amount < 2000) segments['Major Donors'] += 1
      else segments['VIP'] += 1
    })

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return Object.entries(segments).map(([name, value], index) => ({
      name,
      value,
      color: colors[index]
    }))
  }

  async function loadCampaignComparison(startDate, endDate) {
    const { data } = await supabase
      .from('campaigns')
      .select(`
        name,
        donations(amount)
      `)
      .eq('organization_id', organization.id)

    return data?.map(campaign => ({
      name: campaign.name,
      raised: campaign.donations?.reduce((sum, d) => sum + d.amount, 0) || 0,
      donations: campaign.donations?.length || 0
    })).sort((a, b) => b.raised - a.raised).slice(0, 5) || []
  }

  async function exportReport() {
    // Generate CSV report
    const csvData = [
      ['Spiler Analytics Report'],
      [`Organization: ${organization.name}`],
      [`Date Range: ${timeRange}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Overview Metrics'],
      ['Metric', 'Value'],
      ['Total Calls', analytics.overview.totalCalls],
      ['Total Donations', analytics.overview.totalDonations],
      ['Total Raised', formatCurrency(analytics.overview.totalRaised)],
      ['Average Donation', formatCurrency(analytics.overview.avgDonation)],
      ['Conversion Rate', `${analytics.overview.conversionRate?.toFixed(2)}%`],
      ['Growth Rate', `${analytics.overview.growthRate?.toFixed(2)}%`],
      [],
      ['Top Performers'],
      ['Name', 'Calls', 'Donations', 'Amount Raised'],
      ...analytics.topPerformers.map(p => [
        p.name,
        p.calls,
        p.donations,
        formatCurrency(p.raised)
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spiler-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Auto Dialer</span>
                <input
                  type="checkbox"
                  checked={settings.autoDialer}
                  onChange={(e) => setSettings({...settings, autoDialer: e.target.checked})}
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Call Recording</span>
                <input
                  type="checkbox"
                  checked={settings.callRecording}
                  onChange={(e) => setSettings({...settings, callRecording: e.target.checked})}
                  className="toggle"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Organization Info</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {organization?.name || 'Loading...'}</p>
              <p><strong>User:</strong> {user?.email || 'Loading...'}</p>
              <p><strong>Role:</strong> Admin</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// (Removed duplicate analytics functions outside the component.)
// No replacement needed; keep only the analytics functions inside the SettingsPage component.

// MetricCard component definition
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  subtitle
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtitle?: string
}) {
  return (
    <div className="card hover:scale-105 transition-transform">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          <p className={`text-xs mt-2 ${change?.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}

function setAnalytics(arg0: { overview: { totalCalls: number; totalDonations: number; totalRaised: any; avgDonation: number; conversionRate: number; avgCallDuration: number; growthRate: number; dollarsPerCall: number; }; dailyStats: unknown[]; topPerformers: unknown[]; outcomeDistribution: { name: string; value: unknown; color: any; }[]; hourlyPerformance: any[]; donorSegments: { name: string; value: number; color: string; }[]; campaignComparison: { name: any; raised: any; donations: number; }[]; }) {
  throw new Error('Function not implemented.');
}

// (Removed unused setLoading and setAnalytics stubs.)
