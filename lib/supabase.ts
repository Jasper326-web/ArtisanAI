import { createClient } from '@supabase/supabase-js';

// Centralized Supabase client for server-side usage.
// Reads credentials from environment variables.
const supabaseUrl = process.env.SUPABASE_URL;
// Prefer service-role key on the server to bypass RLS for trusted operations (API routes)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !(supabaseServiceKey || supabaseAnonKey)) {
  // Fail fast to avoid silent misconfiguration in server routes
  throw new Error('Missing SUPABASE_URL or SUPABASE_(SERVICE_ROLE_KEY|ANON_KEY) in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];


