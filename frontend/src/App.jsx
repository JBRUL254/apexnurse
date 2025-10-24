import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import supabase from "./supabaseClient";
import TestPage from "./components/TestPage";
import Dashboard from "./components/Dashboard";
import Performance from "./components/Performance";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
          <Link to="/" className="text-2xl font-bold tracking-wide">
            ApexNurse 🩺
          </Link>
          <nav className="flex items-center space-x-6">
            {session ? (
              <>
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/performance" className="hover:underline">Performance</Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : null}
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            {/* Redirect unauthenticated users to login */}
            {!session ? (
              <Route path="*" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/test/:paper/:series" element={<TestPage />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setMessage("Login failed: " + error.message);
    } else {
      setMessage("Check your email for a login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Welcome to ApexNurse</h2>
        <p className="text-gray-600 text-center mb-4">Sign in to continue</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Sending Link..." : "Login"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

export default App;
