// =====================================================
// src/app/example-ssr.js
// Example of how to use Supabase with SSR
// =====================================================

import { createServerClient } from '../lib/supabase/server';
import { createBrowserClient } from '../lib/supabase/client';

// Server Component example
export async function ServerComponentExample() {
  const supabase = createServerClient();
  
  // This runs on the server
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div>
      <h1>Server Component</h1>
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}

// Client Component example
'use client';

import { useEffect, useState } from 'react';

export function ClientComponentExample() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Client Component</h1>
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}

// Route Handler example (app/api/user/route.js)
export async function GET() {
  const supabase = createServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  
  return Response.json({ user });
}
