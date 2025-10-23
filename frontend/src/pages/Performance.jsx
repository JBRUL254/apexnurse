import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Performance() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/performance/${user.id}`)
        .then((r) => r.json())
        .then(setHistory)
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Performance History</h1>
      {history.length === 0 ? (
        <p>No test history yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Paper</th>
              <th className="py-2 px-4 border-b">Series</th>
              <th className="py-2 px-4 border-b">Score</th>
              <th className="py-2 px-4 border-b">Accuracy</th>
              <th className="py-2 px-4 border-b">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="text-center">
                <td className="py-2 border-b">{h.paper}</td>
                <td className="py-2 border-b">{h.series}</td>
                <td className="py-2 border-b">{h.score}/{h.total}</td>
                <td className="py-2 border-b">{h.accuracy.toFixed(1)}%</td>
                <td className="py-2 border-b">{h.time_spent_seconds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
