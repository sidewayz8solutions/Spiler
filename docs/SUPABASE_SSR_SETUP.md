# Supabase SSR Setup Guide

## Overview

This project now uses `@supabase/ssr` for proper Server-Side Rendering (SSR) support with Supabase authentication. The old `@supabase/auth-helpers-nextjs` and `@supabase/auth-helpers-react` packages have been replaced.

## Key Changes

1. **Removed deprecated packages:**
   - `@supabase/auth-helpers-nextjs`
   - `@supabase/auth-helpers-react`

2. **Added modern SSR package:**
   - `@supabase/ssr`

3. **Updated configuration:**
   - Removed `withSupabaseAuth` from `next.config.js`
   - Added proper middleware for auth handling
   - Created separate client configurations for different environments

## File Structure

```
src/lib/supabase/
├── client.js      # Browser-side client
├── server.js      # Server-side client
├── middleware.js  # Middleware client
├── auth.js        # Authentication utilities
└── index.js       # Main exports

middleware.js      # Next.js middleware (root level)
```

## Usage Examples

### Server Components

```javascript
import { createServerClient } from '../lib/supabase/server';

export default async function ServerComponent() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div>
      {user ? `Welcome, ${user.email}!` : 'Not authenticated'}
    </div>
  );
}
```

### Client Components

```javascript
'use client';

import { createBrowserClient } from '../lib/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div>
      {user ? `Welcome, ${user.email}!` : 'Not authenticated'}
    </div>
  );
}
```

### Route Handlers (API Routes)

```javascript
import { createServerClient } from '../../lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  
  return Response.json({ user });
}
```

## Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url (for password reset redirects)
```

## Middleware

The middleware automatically handles:
- Session refresh for expired tokens
- Cookie management for SSR
- Auth state synchronization between server and client

## Migration Notes

If you were using the old auth helpers:

1. Replace `import { supabase } from './client'` with `import { createBrowserClient } from './client'`
2. Call `createBrowserClient()` to get a client instance
3. For server-side code, use `createServerClient()` instead
4. Remove any `withSupabaseAuth` wrappers from your Next.js config

## Benefits

- ✅ Proper SSR support
- ✅ Automatic session management
- ✅ Better performance
- ✅ Type safety
- ✅ Future-proof with latest Supabase features
