import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import TestPage from "./components/TestPage";
import Performance from "./components/Performance";
import { savePerformance } from "./utils/storage";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://apexnurses-backend.onrender.com";

export default function App() {
  const [papers, setPapers] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("dashboard");
  const [scoreData, setScoreData] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // 🌓 Apply dark mode immediately
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // 🌗 Toggle dark mode
  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  }

  // 🗂 Fetch papers
  useEffect(() => {
    async function fetchPapers() {
      try {
        const res = await fetch(`${API_BASE}/papers`);
        const data = await res.json();
        setPapers(data);
      } catch (err) {
        console.error("Failed to load papers", err);
      }
    }
    fetchPapers();
  }, []);

  // 📘 Load series for selected paper
  async function loadSeries(paper) {
    try {
      const res = await fetch(`${API_BASE}/series?paper=${paper}`);
      const data = await res.json();
      setSeries(data);
      setSelectedPaper(paper);
    } catch (err) {
      console.error("Error fetching series", err);
    }
  }

  // 🧩 Start Test (or Random Practice)
  async function startTest(paper, series) {
    if (paper === "random") {
      // Random 20 questions from full DB
      const res = await fetch(`${API_BASE}/questions?paper=paper`);
      const all = await res.json();
      const random20 = all.sort(() => 0.5 - Math.random()).slice(0, 20);
      setQuestions(random20);
      setSelectedPaper("🌀 Random Practice");
      setSelectedSeries("20 Questions");
      setView("test");
    } else {
      const res = await fetch(
        `${API_BASE}/cached_questions?paper=${paper}&series=${series}`
      );
      const data = await res.json();
      setQuestions(data);
      setSelectedPaper(paper);
      setSelectedSeries(series);
      setView("test");
    }
  }

  // 🏁 When test ends
  function finishTest(score, total) {
    const result = { score, total, paper: selectedPaper, series: selectedSeries };
    savePerformance(selectedPaper, selectedSeries, score, total);
    setScoreData(result);
    setView("performance");
  }

  // 🧭 Reset to Dashboard
  function goHome() {
    setSelectedPaper(null);
    setSelectedSeries(null);
    setQuestions([]);
    setView("dashboard");
  }

  // 🎨 Main Layout
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center p-4 shadow bg-white dark:bg-gray-800">
        <h1 className="text-xl font-semibold">🩺 ApexNurse Webservice</h1>
        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

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
          goBack={goHome}
        />
      )}

      {view === "performance" && (
        <Performance data={scoreData} goHome={goHome} />
      )}
    </div>
  );
}
