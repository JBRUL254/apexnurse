import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import TestPage from "./components/TestPage";
import Performance from "./components/Performance";

const API_BASE = import.meta.env.VITE_API_URL || "https://apexnurses-backend.onrender.com";

export default function App() {
  const [papers, setPapers] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("dashboard");
  const [scoreData, setScoreData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  // Fetch available papers
  useEffect(() => {
    async function fetchPapers() {
      const res = await fetch(`${API_BASE}/papers`);
      const data = await res.json();
      setPapers(data);
    }
    fetchPapers();
  }, []);

  // Load series for a paper
  async function loadSeries(paper) {
    const res = await fetch(`${API_BASE}/series?paper=${paper}`);
    const data = await res.json();
    setSeries(data);
    setSelectedPaper(paper);
  }

  // Start a test (series or random)
  async function startTest(series) {
    if (series === "practice-random") {
      const res = await fetch(`${API_BASE}/questions?paper=${selectedPaper || "paper1"}`);
      const all = await res.json();
      const random20 = all.sort(() => 0.5 - Math.random()).slice(0, 20);
      setQuestions(random20);
      setSelectedSeries("🌀 Random Practice");
    } else {
      const res = await fetch(`${API_BASE}/cached_questions?paper=${selectedPaper}&series=${series}`);
      const data = await res.json();
      setQuestions(data);
      setSelectedSeries(series);
    }
    setView("test");
  }

  // Finish test and save to localStorage
  function finishTest(score, total) {
    const record = {
      paper: selectedPaper,
      series: selectedSeries,
      score,
      total,
      date: new Date().toLocaleString(),
    };
    const old = JSON.parse(localStorage.getItem("performance") || "[]");
    localStorage.setItem("performance", JSON.stringify([record, ...old]));
    setScoreData(record);
    setView("performance");
  }

  // Theme toggle
  function toggleTheme() {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
          title="Toggle Theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Views */}
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
