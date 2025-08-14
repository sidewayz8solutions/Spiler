import { supabase } from './client';

export const db = {
  // Organizations
  organizations: {
    async get(id) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Donors
  donors: {
    async list(organizationId, filters = {}) {
      let query = supabase
        .from('donors')
        .select('*')
        .eq('organization_id', organizationId);
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.minScore) {
        query = query.gte('score', filters.minScore);
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      
      // Sort
      query = query.order('score', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(donor) {
      const { data, error } = await supabase
        .from('donors')
        .insert(donor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('donors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async bulkImport(organizationId, donors) {
      const donorsWithOrg = donors.map(d => ({
        ...d,
        organization_id: organizationId
      }));
      
      const { data, error } = await supabase
        .from('donors')
        .insert(donorsWithOrg)
        .select();
      
      if (error) throw error;
      return data;
    },

    async updateScore(donorId) {
      const { data, error } = await supabase
        .rpc('calculate_donor_score', { donor_id: donorId });
      
      if (error) throw error;
      return data;
    }
  },

  // Calls
  calls: {
    async create(call) {
      const { data, error } = await supabase
        .from('calls')
        .insert(call)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByDonor(donorId) {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('donor_id', donorId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getTodaysCalls(organizationId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('started_at', today.toISOString())
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },

  // Queue
  queue: {
    async add(organizationId, donorId, priority = 50) {
      const { data, error } = await supabase
        .from('call_queue')
        .insert({
          organization_id: organizationId,
          donor_id: donorId,
          priority
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async bulkAdd(organizationId, donors) {
      const queueItems = donors.map(d => ({
        organization_id: organizationId,
        donor_id: d.id,
        priority: d.score || 50
      }));
      
      const { data, error } = await supabase
        .from('call_queue')
        .insert(queueItems)
        .select();
      
      if (error) throw error;
      return data;
    },

    async getNext(organizationId, memberId) {
      const { data, error } = await supabase
        .rpc('get_next_donor', {
          org_id: organizationId,
          member_id: memberId
        });
      
      if (error) throw error;
      return data?.[0];
    },

    async list(organizationId) {
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
      return data;
    },

    async remove(id) {
      const { error } = await supabase
        .from('call_queue')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    async updateStatus(id, status) {
      const { data, error } = await supabase
        .from('call_queue')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Campaigns
  campaigns: {
    async list(organizationId) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          scripts(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(campaign) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Scripts
  scripts: {
    async list(organizationId) {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(script) {
      const { data, error } = await supabase
        .from('scripts')
        .insert(script)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('scripts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Donations
  donations: {
    async create(donation) {
      const { data, error } = await supabase
        .from('donations')
        .insert(donation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async list(organizationId, filters = {}) {
      let query = supabase
        .from('donations')
        .select(`
          *,
          donor:donors(full_name, email, phone)
        `)
        .eq('organization_id', organizationId);
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getStats(organizationId) {
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      const total = data.reduce((sum, d) => sum + d.amount, 0);
      const average = data.length > 0 ? total / data.length : 0;
      
      return {
        total,
        average,
        count: data.length
      };
    }
  },

  // Analytics
  analytics: {
    async getDailyStats(organizationId, days = 30) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    async getRealtimeStats(organizationId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get today's calls
      const { data: calls } = await supabase
        .from('calls')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('started_at', today.toISOString());
      
      // Get today's donations
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', today.toISOString());
      
      // Calculate stats
      const totalCalls = calls?.length || 0;
      const successfulCalls = calls?.filter(c => c.outcome === 'donated').length || 0;
      const totalRaised = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const conversionRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      
      return {
        totalCalls,
        successfulCalls,
        totalRaised,
        conversionRate,
        avgDonation: successfulCalls > 0 ? totalRaised / successfulCalls : 0
      };
    }
  }
export default {
  supabase,
  auth,
  db,
  realtime,
  storage
};