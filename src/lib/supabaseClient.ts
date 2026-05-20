import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

// Standard client for public queries (e.g., loading public audit by slug)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (e.g. inserting into leads table, bypassing RLS)
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anon client.");
    return supabase;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
