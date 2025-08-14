import { supabase } from './client';

export const realtime = {
  // Subscribe to call updates
  subscribeToCall(callId, callback) {
    const subscription = supabase
      .channel(`call:${callId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`
        },
        callback
      )
      .subscribe();
    
    return subscription;
  },

  // Subscribe to queue updates
  subscribeToQueue(organizationId, callback) {
    const subscription = supabase
      .channel(`queue:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_queue',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
    
    return subscription;
  },

  // Subscribe to donations
  subscribeToDonations(organizationId, callback) {
    const subscription = supabase
      .channel(`donations:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
    
    return subscription;
  },

  // Subscribe to all organization updates
  subscribeToOrganization(organizationId, callbacks = {}) {
    const channel = supabase.channel(`org:${organizationId}`);
    
    // Calls
    if (callbacks.onCall) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `organization_id=eq.${organizationId}`
        },
        callbacks.onCall
      );
    }
    
    // Queue
    if (callbacks.onQueue) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_queue',
          filter: `organization_id=eq.${organizationId}`
        },
        callbacks.onQueue
      );
    }
    
    // Donations
    if (callbacks.onDonation) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `organization_id=eq.${organizationId}`
        },
        callbacks.onDonation
      );
    }
    
    channel.subscribe();
    return channel;
  },

  // Unsubscribe from channel
  unsubscribe(subscription) {
    supabase.removeChannel(subscription);
  }
export default {
  supabase,
  auth,
  db,
  realtime,
  storage
};
