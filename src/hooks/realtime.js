import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// =====================================================
// Hook: Monitor Queue Changes in Real-time
// =====================================================
export function useRealtimeQueue(organizationId) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    // Initial load
    loadQueue();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`queue-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_queue',
          filter: `organization_id=eq.${organizationId}`
        },
        async (payload) => {
          console.log('Queue change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the full donor data for the new queue item
            const { data: donor } = await supabase
              .from('donors')
              .select('*')
              .eq('id', payload.new.donor_id)
              .single();
            
            setQueue(prev => [...prev, { ...payload.new, donor }]);
          } else if (payload.eventType === 'UPDATE') {
            setQueue(prev => prev.map(item => 
              item.id === payload.new.id ? { ...item, ...payload.new } : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    async function loadQueue() {
      try {
        const { data, error } = await supabase
          .from('call_queue')
          .select(`
            *,
            donor:donors(*)
          `)
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .order('priority', { ascending: false });

        if (error) throw error;
        setQueue(data || []);
      } catch (error) {
        console.error('Error loading queue:', error);
      } finally {
        setLoading(false);
      }
    }

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return { queue, loading };
}

// =====================================================
// Hook: Monitor Active Calls in Real-time
// =====================================================
export function useRealtimeCalls(organizationId) {
  const [calls, setCalls] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    totalRaised: 0
  });

  useEffect(() => {
    if (!organizationId) return;

    // Load initial data
    loadTodaysCalls();

    // Subscribe to new calls
    const channel = supabase
      .channel(`calls-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('New call:', payload.new);
          setCalls(prev => [payload.new, ...prev]);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            total: prev.total + 1
          }));
          
          // Add to active calls if not completed
          if (!payload.new.ended_at) {
            setActiveCalls(prev => [...prev, payload.new]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('Call updated:', payload.new);
          
          // Update call in list
          setCalls(prev => prev.map(call => 
            call.id === payload.new.id ? payload.new : call
          ));
          
          // Update active calls
          if (payload.new.ended_at) {
            // Remove from active if call ended
            setActiveCalls(prev => prev.filter(c => c.id !== payload.new.id));
            
            // Update stats if donated
            if (payload.new.outcome === 'donated' && payload.new.donation_amount) {
              setStats(prev => ({
                ...prev,
                successful: prev.successful + 1,
                totalRaised: prev.totalRaised + payload.new.donation_amount
              }));
            }
          }
        }
      )
      .subscribe();

    async function loadTodaysCalls() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', today.toISOString());

        if (error) throw error;
        
        setCalls(data || []);
        setActiveCalls(data?.filter(c => !c.ended_at) || []);
        
        // Calculate stats
        const successful = data?.filter(c => c.outcome === 'donated') || [];
        const totalRaised = successful.reduce((sum, c) => sum + (c.donation_amount || 0), 0);
        
        setStats({
          total: data?.length || 0,
          successful: successful.length,
          totalRaised
        });
      } catch (error) {
        console.error('Error loading calls:', error);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return { calls, activeCalls, stats };
}

// =====================================================
// Hook: Monitor Donations with Celebration
// =====================================================
export function useRealtimeDonations(organizationId, onNewDonation) {
  const [donations, setDonations] = useState([]);
  const [todaysTotal, setTodaysTotal] = useState(0);

  useEffect(() => {
    if (!organizationId) return;

    loadTodaysDonations();

    const channel = supabase
      .channel(`donations-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `organization_id=eq.${organizationId}`
        },
        async (payload) => {
          console.log('NEW DONATION!', payload.new);
          
          // Get donor info
          const { data: donor } = await supabase
            .from('donors')
            .select('full_name')
            .eq('id', payload.new.donor_id)
            .single();
          
          const donationWithDonor = {
            ...payload.new,
            donor
          };
          
          setDonations(prev => [donationWithDonor, ...prev]);
          setTodaysTotal(prev => prev + payload.new.amount);
          
          // Trigger celebration callback
          if (onNewDonation) {
            onNewDonation(donationWithDonor);
          }
        }
      )
      .subscribe();

    async function loadTodaysDonations() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        const { data, error } = await supabase
          .from('donations')
          .select(`
            *,
            donor:donors(full_name)
          `)
          .eq('organization_id', organizationId)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setDonations(data || []);
        setTodaysTotal(data?.reduce((sum, d) => sum + d.amount, 0) || 0);
      } catch (error) {
        console.error('Error loading donations:', error);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, onNewDonation]);

  return { donations, todaysTotal };
}

// =====================================================
// Hook: Track Online Fundraisers (Presence)
// =====================================================
export function useOnlineFundraisers(organizationId, currentUser) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!organizationId || !currentUser) return;

    const channel = supabase.channel(`online-${organizationId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            user_name: currentUser.name,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [organizationId, currentUser]);

  return onlineUsers;
}

// =====================================================
// Hook: Broadcast Events (Celebrations, Milestones)
// =====================================================
export function useBroadcast(organizationId) {
  const [events, setEvents] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase.channel(`events-${organizationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'donation' }, (payload) => {
        setEvents(prev => [...prev, { type: 'donation', ...payload }]);
      })
      .on('broadcast', { event: 'milestone' }, (payload) => {
        setEvents(prev => [...prev, { type: 'milestone', ...payload }]);
      })
      .on('broadcast', { event: 'call-started' }, (payload) => {
        setEvents(prev => [...prev, { type: 'call', ...payload }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const broadcast = useCallback((event, payload) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }, []);

  return { events, broadcast };
}

// =====================================================
// Hook: Real-time Stats Dashboard
// =====================================================
export function useRealtimeStats(organizationId) {
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    totalRaised: 0,
    conversionRate: 0,
    queueSize: 0,
    activeFundraisers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    // Load initial stats
    loadStats();

    // Subscribe to all relevant changes
    const channel = supabase
      .channel(`stats-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `organization_id=eq.${organizationId}`
        },
        () => loadStats() // Reload stats on any call change
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `organization_id=eq.${organizationId}`
        },
        () => loadStats() // Reload stats on new donation
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_queue',
          filter: `organization_id=eq.${organizationId}`
        },
        () => loadStats() // Reload stats on queue change
      )
      .subscribe();

    async function loadStats() {
      try {
        // Use the SQL function we created for optimized stats
        const { data, error } = await supabase
          .rpc('get_realtime_stats', { org_id: organizationId });

        if (error) throw error;
        
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    // Refresh stats every 30 seconds as backup
    const interval = setInterval(loadStats, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  return { stats, loading };
}

// =====================================================
// Hook: Auto-refresh Donor Scores
// =====================================================
export function useRealtimeDonorScores(organizationId) {
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`donor-scores-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `organization_id=eq.${organizationId}`
        },
        async (payload) => {
          // When a call is completed, update the donor's score
          if (payload.new.outcome && payload.new.donor_id) {
            await supabase.rpc('calculate_donor_score', {
              donor_id: payload.new.donor_id
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);
}

// =====================================================
// Example Usage in Component
// =====================================================
/*
function DialerDashboard() {
  const { user, organization } = useAuth();
  
  // Use all the real-time hooks
  const { queue } = useRealtimeQueue(organization.id);
  const { calls, activeCalls, stats: callStats } = useRealtimeCalls(organization.id);
  const { donations, todaysTotal } = useRealtimeDonations(organization.id, (donation) => {
    // Show celebration animation
    toast.success(`🎉 ${donation.donor.full_name} donated $${donation.amount}!`);
  });
  const onlineUsers = useOnlineFundraisers(organization.id, user);
  const { events, broadcast } = useBroadcast(organization.id);
  const { stats } = useRealtimeStats(organization.id);
  
  // Everything updates in real-time!
  return (
    <div>
      <h1>Live Dashboard</h1>
      <p>Queue Size: {queue.length}</p>
      <p>Active Calls: {activeCalls.length}</p>
      <p>Today's Total: ${todaysTotal}</p>
      <p>Online Fundraisers: {onlineUsers.length}</p>
      <p>Conversion Rate: {stats.conversionRate}%</p>
    </div>
  );
}
*/