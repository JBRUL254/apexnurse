// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ✅ Replace these with your actual environment values from Render or .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials. Check your .env file or Render environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: "public" },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
