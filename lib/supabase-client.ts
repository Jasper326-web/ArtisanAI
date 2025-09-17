// Client-side Supabase client for browser usage
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jraglvblkwibaehpihqo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdsdmJsa3dpYmFlaHBpaHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTE0MjQsImV4cCI6MjA3MjM4NzQyNH0.AJKwI1TI4vEskxsAygzes95oh-KWXFXusG7Y66ZhP_o';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createClient();
