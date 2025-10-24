import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://apexnurses.onrender.com";

function App() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [series, setSeries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [rationale, setRationale] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  // === Load available papers & series automatically ===
  useEffect(() => {
    async function fetchPapers() {
      const res = await fetch(`${API_BASE}/papers`);
      const data = await res.json();
      setPapers(data);
    }
    fetchPapers();
  }, []);

  // === Select a paper ===
  async function handleSelectPaper(paper) {
    setSelectedPaper(paper);
    const res = await fetch(`${API_BASE}/series?paper=${paper}`);
    const data = await res.json();
    setSeries(data);
  }

  // === Start Test ===
  async function startTest(s) {
    setLoading(true);
    const res = await fetch(`${API_BASE}/cached_questions?paper=${selectedPaper}&series=${s}`);
    const data = await res.json();
    setQuestions(data);
    setCurrent(0);
    setFinished(false);
    setScore(0);
    setLoading(false);
  }

  // === Handle answer ===
  function submitAnswer() {
    if (!selected) return;
    const correct = selected === questions[current].correct_answer;
    if (correct) setScore((s) => s + 1);
    setRationale(questions[current].rationale || "");
    setShowAnswer(true);
  }

  function nextQuestion() {
    setShowAnswer(false);
    setSelected(null);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  }

  function finishTest() {
    setFinished(true);
  }

  if (finished)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Test Complete ✅
        </h1>
        <p className="text-lg">Score: {score} / {questions.length}</p>
        <button
          onClick={() => {
            setQuestions([]);
            setSelectedPaper(null);
            setSeries([]);
          }}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );

  if (!selectedPaper)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Select Paper</h1>
        {papers.map((p) => (
          <button
            key={p}
            onClick={() => handleSelectPaper(p)}
            className="bg-white shadow px-4 py-2 m-2 rounded hover:bg-blue-50"
          >
            {p}
          </button>
        ))}
      </div>
    );

  if (questions.length === 0 && !loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Choose a Series</h2>
        {series.map((s) => (
          <button
            key={s}
            onClick={() => startTest(s)}
            className="bg-blue-600 text-white px-4 py-2 rounded m-2"
          >
            Start {s}
          </button>
        ))}
      </div>
    );

  if (loading) return <div className="text-center mt-10">Loading questions...</div>;

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {selectedPaper} – {q.series} ({current + 1}/{questions.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNav((s) => !s)}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            ☰
          </button>
          <button
            onClick={finishTest}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Finish Test
          </button>
        </div>
      </div>

      {showNav && (
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrent(idx);
                setShowNav(false);
              }}
              className={`px-3 py-1 rounded ${idx === current ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white p-4 rounded shadow">
        <p className="mb-4 font-medium">{q.question}</p>
        <div className="flex flex-col gap-2">
          {["A", "B", "C", "D"].map((opt) => (
            <label
              key={opt}
              className={`border p-2 rounded cursor-pointer ${selected === q[`option_${opt.toLowerCase()}`] ? "bg-blue-50 border-blue-400" : ""}`}
            >
              <input
                type="radio"
                name="option"
                value={q[`option_${opt.toLowerCase()}`]}
                onChange={(e) => setSelected(e.target.value)}
                className="mr-2"
              />
              {q[`option_${opt.toLowerCase()}`]}
            </label>
          ))}
        </div>

        {!showAnswer && (
          <button
            onClick={submitAnswer}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Check Answer
          </button>
        )}

        {showAnswer && (
          <div className="mt-4 bg-blue-50 p-3 rounded">
            <p className="text-green-600 font-semibold">
              Correct Answer: {q.correct_answer}
            </p>
            {rationale && <p className="mt-2 text-gray-700">{rationale}</p>}
            <button
              onClick={nextQuestion}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
