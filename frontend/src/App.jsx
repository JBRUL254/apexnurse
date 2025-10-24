import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import TestPage from "./components/TestPage";
import Performance from "./components/Performance";

const API_BASE = import.meta.env.VITE_API_URL || "https://apexnurses.onrender.com";

export default function App() {
  const [papers, setPapers] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("dashboard");
  const [scoreData, setScoreData] = useState(null);

  // Fetch papers automatically
  useEffect(() => {
    async function fetchPapers() {
      const res = await fetch(`${API_BASE}/papers`);
      const data = await res.json();
      setPapers(data);
    }
    fetchPapers();
  }, []);

  // Load series for selected paper
  async function loadSeries(paper) {
    const res = await fetch(`${API_BASE}/series?paper=${paper}`);
    const data = await res.json();
    setSeries(data);
    setSelectedPaper(paper);
  }

  // Start test
  async function startTest(series) {
    const res = await fetch(`${API_BASE}/cached_questions?paper=${selectedPaper}&series=${series}`);
    const data = await res.json();
    setQuestions(data);
    setSelectedSeries(series);
    setView("test");
  }

  // When test ends
  function finishTest(score, total) {
    setScoreData({ score, total, paper: selectedPaper, series: selectedSeries });
    setView("performance");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === "dashboard" && (
        <Dashboard
          papers={papers}
          loadSeries={loadSeries}
          selectedPaper={selectedPaper}
          series={series}
          startTest={startTest}
        />
      )}
      {view === "test" && (
        <TestPage
          questions={questions}
          finishTest={finishTest}
          paper={selectedPaper}
          series={selectedSeries}
          goBack={() => setView("dashboard")}
        />
      )}
      {view === "performance" && (
        <Performance data={scoreData} goHome={() => setView("dashboard")} />
      )}
    </div>
  );
}
