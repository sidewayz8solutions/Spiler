// =====================================================
// src/lib/supabase/client.js
// Browser-side Supabase client for SSR
// =====================================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Legacy export for backward compatibility
export const supabase = createClient();