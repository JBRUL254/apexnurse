import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Performance({ data, goHome, user }) {
  const [saved, setSaved] = useState(false);

  if (!data) return null;

  const { score, total, paper, series } = data;
  const percent = ((score / total) * 100).toFixed(1);

  useEffect(() => {
    async function savePerformance() {
      if (!user?.id || saved) return;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/performance`, {
          user_id: user.id,
          paper,
          series,
          score,
          total,
        });
        setSaved(true);
      } catch (err) {
        console.error("Failed to save performance:", err);
      }
    }
    savePerformance();
  }, [user, saved]);

  const scoreColor =
    percent >= 80 ? "text-green-600" : percent >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Test Complete ✅
      </h1>

      <div className="bg-white p-6 rounded shadow-md text-center w-full max-w-md">
        <p className="text-lg mb-2 font-medium">Paper: {paper}</p>
        <p className="text-lg mb-2 font-medium">Series: {series}</p>
        <p className={`text-xl mb-4 font-bold ${scoreColor}`}>
          Score: {score} / {total} ({percent}%)
        </p>

        {saved ? (
          <p className="text-green-600 text-sm mb-3">Performance saved ✅</p>
        ) : (
          <p className="text-gray-500 text-sm mb-3">Saving performance...</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={goHome}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline text-sm"
          >
            View All Results
          </button>
        </div>
      </div>
    </div>
  );
}
