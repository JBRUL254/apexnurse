import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/performance/${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.length > 0) {
            const attempts = data;
            const total = attempts.reduce((a, b) => a + b.total, 0);
            const score = attempts.reduce((a, b) => a + b.score, 0);
            setStats({
              attempted: total,
              accuracy: ((score / total) * 100).toFixed(1),
              tests: attempts.length,
            });
          }
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back, {user?.email?.split("@")[0]}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold">Tests Attempted</h2>
          <p className="text-2xl">{stats?.tests || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold">Questions Attempted</h2>
          <p className="text-2xl">{stats?.attempted || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold">Accuracy</h2>
          <p className="text-2xl">{stats?.accuracy || 0}%</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Take New Test
        </button>
        <button
          onClick={() => navigate("/performance")}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          View Performance
        </button>
      </div>
    </div>
  );
}
