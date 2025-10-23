// src/pages/ConfigCheck.jsx
import { supabase } from "../utils/supabaseClient";

export default function ConfigCheck() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Config check</h2>
      <pre style={{whiteSpace: "pre-wrap", background:"#fff", padding:12, borderRadius:6}}>
        SUPABASE URL: {import.meta.env.VITE_SUPABASE_URL ? "set" : "MISSING"}{"\n"}
        SUPABASE ANON KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "set" : "MISSING"}{"\n\n"}
        supabase object: {supabase ? "ok" : "undefined"}{"\n"}
        supabase.auth exists: {supabase && supabase.auth ? "ok" : "undefined"}{"\n"}
        supabase global fetch present: {typeof (supabase && supabase._getClient) !== "undefined" ? "ok (internal)" : "unknown"}
      </pre>
      <p className="text-sm text-slate-600 mt-3">Open browser console for detailed object inspection: <code>console.log(supabase)</code></p>
    </div>
  );
}
