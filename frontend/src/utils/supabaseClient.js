// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety guards - will show clear error in browser console if missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Helpful, visible console message for debugging on the client
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
    "Make sure these env variables exist and start with VITE_. " +
    "Current values:",
    { SUPABASE_URL, SUPABASE_ANON_KEY }
  );
}

// ensure there is a fetch available; browsers have global fetch, but build environments can differ
const safeFetch = (typeof globalThis.fetch === "function")
  ? globalThis.fetch.bind(globalThis)
  : (...args) => {
      // As a last resort, try to use window.fetch if present
      if (typeof window !== "undefined" && typeof window.fetch === "function") {
        return window.fetch(...args);
      }
      // If absolutely no fetch (unlikely in browser), throw a helpful error
      throw new Error("No fetch available in this environment.");
    };

// Create client with explicit auth + global fetch mapping
export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  // pass the fetch implementation explicitly so supabase doesn't try to read undefined
  global: { fetch: safeFetch },
});
