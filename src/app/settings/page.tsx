'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/layout/Navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSupabase } from '@/components/providers/Providers'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  PhoneIcon, 
  UserGroupIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatDuration } from '@/lib/utils/formatters'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AnalyticsPage() {
  const { user, organization } = useAuth()
  const supabase = useSupabase()
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    overview: {},
    dailyStats: [],
    topPerformers: [],
    outcomeDistribution: [],
    hourlyPerformance: [],
    donorSegments: [],
    campaignComparison: []
  })

  useEffect(() => {
    if (organization?.id) {
      loadAnalytics()
    }
  }, [organization, timeRange])

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

  async function loadDailyStats(startDate, endDate) {
    const { data } = await supabase
      .from('donations')
      .select('amount, created_at')
      .eq('organization_id', organization.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at')

    // Group by day
    const dailyMap = {}
    data?.forEach(donation => {
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
          name: call.organization_members?.full_name || 'Unknown',
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

    return Object.values(performerMap)
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
      value,
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
    const hourlyMap = {}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiler-darker to-spiler-dark">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Campaign Analytics</h1>
            <p className="text-gray-400">Track performance and maximize your fundraising impact</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Export Button */}
            <button
              onClick={exportReport}
              className="btn btn-primary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Raised"
            value={formatCurrency(analytics.overview.totalRaised)}
            change={`${analytics.overview.growthRate > 0 ? '+' : ''}${analytics.overview.growthRate?.toFixed(1)}%`}
            icon={CurrencyDollarIcon}
            color="from-green-500 to-emerald-600"
            subtitle={`Avg: ${formatCurrency(analytics.overview.avgDonation)}`}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analytics.overview.conversionRate?.toFixed(1)}%`}
            change={`${analytics.overview.totalDonations} donations`}
            icon={TrophyIcon}
            color="from-purple-500 to-pink-600"
            subtitle={`From ${analytics.overview.totalCalls} calls`}
          />
          <MetricCard
            title="$/Call"
            value={formatCurrency(analytics.overview.dollarsPerCall)}
            change="Key efficiency metric"
            icon={ArrowTrendingUpIcon}
            color="from-indigo-500 to-blue-600"
            subtitle="Revenue per dial"
          />
          <MetricCard
            title="Avg Call Time"
            value={formatDuration(analytics.overview.avgCallDuration)}
            change={`${analytics.overview.totalCalls} total calls`}
            icon={ClockIcon}
            color="from-orange-500 to-red-600"
            subtitle="Call efficiency"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Fundraising Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Fundraising Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Call Outcomes */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Call Outcome Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.outcomeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.outcomeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {analytics.outcomeDistribution.map((outcome) => (
                <div key={outcome.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: outcome.color }} />
                  <span className="text-xs text-gray-400">{outcome.name}: {outcome.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Hourly Performance */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Optimal Calling Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.hourlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }} />
                <Bar yAxisId="left" dataKey="calls" fill="#6366f1" />
                <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donor Segments */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Donor Segments</h3>
            <div className="space-y-3">
              {analytics.donorSegments.map((segment) => (
                <div key={segment.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{segment.name}</span>
                    <span className="text-gray-400">{segment.value}</span>
                  </div>
                  <div className="h-2 bg-spiler-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${(segment.value / Math.max(...analytics.donorSegments.map(s => s.value))) * 100}%`,
                        backgroundColor: segment.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Fundraisers Leaderboard 🏆</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-500/20">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-center py-3 px-4">Calls</th>
                  <th className="text-center py-3 px-4">Donations</th>
                  <th className="text-center py-3 px-4">Conversion</th>
                  <th className="text-right py-3 px-4">Amount Raised</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPerformers.map((performer, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 px-4">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                    </td>
                    <td className="py-3 px-4 font-medium">{performer.name}</td>
                    <td className="text-center py-3 px-4">{performer.calls}</td>
                    <td className="text-center py-3 px-4">{performer.donations}</td>
                    <td className="text-center py-3 px-4">
                      <span className="badge bg-indigo-500/20 text-indigo-400">
                        {performer.calls > 0 ? ((performer.donations / performer.calls) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-green-400">
                      {formatCurrency(performer.raised)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Comparison */}
        {analytics.campaignComparison.length > 0 && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.campaignComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="raised" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle }) {
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