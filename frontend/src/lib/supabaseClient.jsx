import { createClient } from "@supabase/supabase-js";

// Environment variables (must start with VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Basic guard for undefined values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing!");
}

// ✅ Create client safely
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: (...args) => fetch(...args) }, // ensures fetch exists in all browsers
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
