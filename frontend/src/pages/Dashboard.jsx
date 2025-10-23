import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();
        if (error) console.error("Error fetching user:", error);
        setUser(user || null);
      } catch (err) {
        console.error("Supabase auth.getUser() failed:", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/questions`);
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="text-xl font-semibold mb-3">Session expired</p>
        <a href="/" className="text-blue-600 underline">Log in again</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Welcome {user.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.length > 0 ? (
          questions.map((q, i) => (
            <div key={i} className="p-4 bg-white rounded shadow">
              <h2 className="font-semibold">{q.paper || `Paper ${i + 1}`}</h2>
              <p className="text-slate-600 text-sm">{q.question || "Sample question text"}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500">No questions found.</p>
        )}
      </div>
    </div>
  );
}
