'use client'

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import RecentActivity from '@/components/dashboard/RecentActivity';
import Navigation from '@/components/layout/Navigation';
import { useSupabase } from '@/components/providers/Providers';

export default function HomePage() {
  const supabase = useSupabase() as any
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDonors: 0,
    totalRaised: 0,
    successRate: 0,
    activeCalls: 0,
    todaysCalls: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  async function loadDashboardStats() {
    try {
      // Get total calls
      const { data: calls } = await supabase
        .from('calls')
        .select('*')

      // Get total donors
      const { data: donors } = await supabase
        .from('donors')
        .select('*')

      // Get total donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')

      // Calculate stats
      const totalRaised = donations?.reduce((sum, d) => sum + d.amount, 0) || 0
      const successfulCalls = calls?.filter(c => c.outcome === 'donated').length || 0
      const successRate = calls?.length > 0 ? Math.round((successfulCalls / calls.length) * 100) : 0

      // Get today's calls
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todaysCalls } = await supabase
        .from('calls')
        .select('*')
        .gte('created_at', today.toISOString())

      setStats({
        totalCalls: calls?.length || 0,
        totalDonors: donors?.length || 0,
        totalRaised,
        successRate,
        activeCalls: calls?.filter(c => c.status === 'active').length || 0,
        todaysCalls: todaysCalls?.length || 0
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-pattern" style={{ minHeight: '100vh' }}>
      <Navigation />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Spiler Dashboard
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--spiler-text-muted)' }}>
            Professional Campaign Fundraising Auto-Dialer
          </p>
        </div>

        {/* Quick Actions */}
        <div className="slide-in-up" style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dialer" className="btn btn-success glow">
            🚀 Start Calling
          </Link>
          <Link href="/analytics" className="btn btn-secondary">
            📊 View Analytics
          </Link>
          <Link href="/donors" className="btn btn-secondary">
            👥 Manage Donors
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="slide-in-left" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Active Calls */}
          <div className="card glow-hover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--spiler-text)' }}>Active Calls</h3>
              <div className="status-online"></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--spiler-success)', marginBottom: '0.5rem' }}>
              {loading ? '...' : stats.activeCalls}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--spiler-text-muted)' }}>
              {loading ? '...' : stats.todaysCalls} calls today
            </div>
          </div>

          {/* Total Donors */}
          <div className="card glow-hover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--spiler-text)' }}>Total Donors</h3>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--spiler-primary)', marginBottom: '0.5rem' }}>
              {loading ? '...' : stats.totalDonors.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--spiler-text-muted)' }}>
              Registered donors
            </div>
          </div>

          {/* Funds Raised */}
          <div className="card glow-hover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--spiler-text)' }}>Funds Raised</h3>
              <span style={{ fontSize: '1.5rem' }}>💰</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--spiler-warning)', marginBottom: '0.5rem' }}>
              {loading ? '...' : `$${stats.totalRaised.toLocaleString()}`}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--spiler-text-muted)' }}>
              Total campaign funds
            </div>
          </div>

          {/* Success Rate */}
          <div className="card glow-hover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--spiler-text)' }}>Success Rate</h3>
              <span style={{ fontSize: '1.5rem' }}>📈</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--spiler-secondary)', marginBottom: '0.5rem' }}>
              {loading ? '...' : `${stats.successRate}%`}
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--spiler-dark)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--spiler-secondary), var(--spiler-primary))',
                  borderRadius: '4px',
                  width: `${stats.successRate}%`,
                  transition: 'width 0.5s ease'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="slide-in-right" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}>
          {/* Recent Activity */}
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--spiler-text)' }}>
              📊 Recent Activity
            </h2>
            <RecentActivity organizationId="default" />
          </div>

          {/* Quick Stats & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Today's Performance */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--spiler-text)' }}>
                🎯 Today's Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--spiler-text-muted)' }}>Calls Made</span>
                  <span style={{ color: 'var(--spiler-text)', fontWeight: '600' }}>
                    {loading ? '...' : stats.todaysCalls}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--spiler-text-muted)' }}>Active Now</span>
                  <span style={{ color: 'var(--spiler-success)', fontWeight: '600' }}>
                    {loading ? '...' : stats.activeCalls}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--spiler-text-muted)' }}>Success Rate</span>
                  <span style={{ color: 'var(--spiler-secondary)', fontWeight: '600' }}>
                    {loading ? '...' : `${stats.successRate}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--spiler-text)' }}>
                ⚡ Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/donors" className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  👥 Manage Donors
                </Link>
                <Link href="/queue" className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  📞 View Call Queue
                </Link>
                <Link href="/settings" className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  ⚙️ Campaign Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}