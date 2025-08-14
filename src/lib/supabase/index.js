// =====================================================
// src/lib/supabase/index.js
// Main Supabase exports for SSR
// =====================================================

// Client-side exports
export { createClient as createBrowserClient } from './client';

// Server-side exports
export { createClient as createServerClient } from './server';

// Middleware exports
export { createClient as createMiddlewareClient } from './middleware';

// Auth utilities
export { auth } from './auth';

// Legacy exports for backward compatibility
export { supabase } from './client';
