import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin credentials. Please check your .env file.');
}

// Service role client with admin privileges that bypasses RLS policies
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
