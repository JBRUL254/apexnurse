import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard({ user, papers, loadSeries, selectedPaper, series, startTest }) {
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    if (user?.id) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/performance?user_id=${user.id}`)
        .then((res) => setPerformance(res.data))
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">ApexNurse Dashboard</h1>

      {!selectedPaper ? (
        <>
          <h2 className="text-xl mb-3">📘 Select a Paper</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {papers.map((p) => (
              <button
                key={p}
                onClick={() => loadSeries(p)}
                className="bg-white shadow px-4 py-2 rounded hover:bg-blue-50"
              >
                {p}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold mt-10 mb-2">📊 Past Performance</h3>
          {performance.length ? (
            <div className="bg-white p-4 rounded shadow max-w-md w-full">
              {performance.map((p, i) => (
                <div key={i} className="border-b py-2 text-sm">
                  <p>
                    <b>{p.paper}</b> – {p.series}
                  </p>
                  <p>
                    Score: {p.score}/{p.total} (
                    {((p.score / p.total) * 100).toFixed(1)}%)
                  </p>
                  <p className="text-gray-500 text-xs">{p.created_at}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No performance data yet.</p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-xl mb-3">📚 Choose a Series</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {series.map((s) => (
              <button
                key={s}
                onClick={() => startTest(s)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-gray-500 hover:text-blue-600"
          >
            ← Back to Papers
          </button>
        </>
      )}
    </div>
  );
}
