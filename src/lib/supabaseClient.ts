import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      supabaseServiceKey &&
      supabaseServiceKey !== "placeholder-service-key"
  );
}

// Standard client for public queries (e.g., loading public audit by slug)
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// Admin client for backend operations (e.g. inserting into leads table, bypassing RLS)
export const getSupabaseAdmin = () => {
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
    return supabase;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
