import { createClient } from "@supabase/supabase-js";

// ✅ Replace with your real Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
