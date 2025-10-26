import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PaperDetails({ paper, startTest, goBack }) {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [quicktests, setQuicktests] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_URL || "https://your-backend-url.onrender.com";

  useEffect(() => {
    async function fetchSets() {
      try {
        const s = await axios.get(`${BASE_URL}/series?paper=${paper}&qtype=series`);
        const q = await axios.get(`${BASE_URL}/series?paper=${paper}&qtype=quicktest`);
        setSeries(s.data);
        setQuicktests(q.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSets();
  }, [paper]);

  if (loading) return <p className="p-6 text-center">Loading sets...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">{paper}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revision Series */}
        <div className="bg-white shadow rounded-lg p-4 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Revision Series</h2>
          <div className="grid grid-cols-2 gap-3">
            {series.map((s) => (
              <button
                key={s}
                onClick={() => startTest(s, "series")}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tests */}
        <div className="bg-white shadow rounded-lg p-4 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Quick Tests</h2>
          <div className="grid grid-cols-2 gap-3">
            {quicktests.map((q) => (
              <button
                key={q}
                onClick={() => startTest(q, "quicktest")}
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {q.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={goBack}
        className="mt-8 text-gray-600 hover:text-blue-600 underline"
      >
        ← Back to Papers
      </button>
    </div>
  );
}
