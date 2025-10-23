// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // quick dev debug - logs supabase shape (remove in prod)
  console.debug("Supabase client (login):", {
    hasSupabase: !!supabase,
    authExists: !!(supabase && supabase.auth),
    signInFn: supabase?.auth?.signInWithPassword?.toString?.()?.slice(0, 80) ?? "missing",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client not initialized correctly (supabase or supabase.auth is undefined). Check env vars and client setup.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // on success navigate
      nav("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
      // OAuth will redirect — no further action here
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login error: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-[420px] bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-2">ApexNurse</h1>
        <p className="text-sm text-center mb-6 text-slate-500">Your personalised space for mastering every question</p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input required className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? "Signing in..." : "Log in"}</button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={handleGoogle} className="w-full py-2 border rounded">Continue with Google</button>
        </div>

        <div className="mt-3 text-sm text-center text-slate-500">
          If login fails, open the browser console to see env/client diagnostics.
        </div>
      </div>
    </div>
  );
}
