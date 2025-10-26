import React, { useState, useEffect } from "react";
import axios from "axios";
import PaperDetails from "./PaperDetails";

export default function Dashboard({ user, startTest, viewPerformance }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL || "https://apexnurses-backend.onrender.com";

  useEffect(() => {
    async function fetchPapers() {
      try {
        const res = await axios.get(`${BASE_URL}/papers`);
        setPapers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPapers();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading papers...</p>;

  if (selectedPaper)
    return (
      <PaperDetails
        paper={selectedPaper}
        startTest={(series, type) => startTest(selectedPaper, series, type)}
        goBack={() => setSelectedPaper(null)}
      />
    );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">📘 ApexNurse Dashboard</h1>
        <button
          onClick={viewPerformance}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          View Performance
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {papers.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPaper(p)}
            className="bg-white shadow-lg border rounded-lg p-4 hover:bg-blue-50 transition text-gray-800 font-semibold"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
