import React, { useState } from "react";
import sharkLogo from "../assets/deepseek-shark.png";

export default function TestPage({ questions, finishTest, paper, series, goBack }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [deepSeekResponse, setDeepSeekResponse] = useState("");
  const [loadingDeepSeek, setLoadingDeepSeek] = useState(false);

  const q = questions[current];
  if (!q)
    return (
      <div className="p-10 text-center">
        <p>No questions found.</p>
        <button onClick={goBack} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          ← Back
        </button>
      </div>
    );

  const questionText = q.question || q.question_text || q.text || "No question text found";
  const options = [
    q.option_a || q.opt1 || q.option1,
    q.option_b || q.opt2 || q.option2,
    q.option_c || q.opt3 || q.option3,
    q.option_d || q.opt4 || q.option4,
  ].filter(Boolean);
  const cleanedOptions = options.map((opt) => opt.replace(/Answer:.*/i, "").trim());
  const correctAnswer = q.correct_answer || q.answer || q.correct || "";
  const rationale = q.rationale || q.explanation || "";
  const total = questions.length;
  const selected = selectedAnswers[current] || null;

  function handleSelect(option) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  }

  function submitAnswer() {
    if (!selected) return;
    const correct = selected === correctAnswer;
    if (correct) setScore((s) => s + 1);
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowAnswer(false);
      setDeepSeekResponse("");
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
      setDeepSeekResponse("");
    }
  }

  function handleFinish() {
    finishTest(score, total);
  }

  async function askDeepSeek() {
    setLoadingDeepSeek(true);
    setDeepSeekResponse("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/deepseek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });
      const data = await res.json();
      setDeepSeekResponse(data.response || "No explanation found.");
    } catch (err) {
      setDeepSeekResponse("Error fetching explanation.");
    }
    setLoadingDeepSeek(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {paper} – {series} ({current + 1}/{total})
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowNav(!showNav)} className="bg-gray-200 px-3 py-1 rounded">
            ☰
          </button>
          <button onClick={handleFinish} className="bg-red-500 text-white px-3 py-1 rounded">
            Finish Test
          </button>
        </div>
      </div>

      {/* Question */}
      <p className="mb-3 font-medium text-gray-800">{questionText}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {cleanedOptions.map((opt, idx) => (
          <label
            key={idx}
            className={`border p-2 rounded cursor-pointer ${
              selected === opt ? "bg-blue-50 border-blue-400" : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`option-${current}`}
              value={opt}
              checked={selected === opt}
              onChange={() => handleSelect(opt)}
              className="mr-2"
            />
            {opt}
          </label>
        ))}
      </div>

      {/* DeepSeek button */}
      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={askDeepSeek}
          className="flex items-center bg-cyan-600 text-white px-3 py-2 rounded hover:bg-cyan-700"
        >
          <img src={sharkLogo} alt="DeepSeek" className="w-5 h-5 mr-2" />
          Ask DeepSeek
        </button>
        {loadingDeepSeek && <p className="text-sm text-gray-500">Thinking...</p>}
      </div>

      {deepSeekResponse && (
        <div className="mt-3 bg-cyan-50 border border-cyan-200 p-3 rounded text-gray-800">
          <h4 className="font-semibold text-cyan-700 mb-2">DeepSeek says:</h4>
          <p>{deepSeekResponse}</p>
        </div>
      )}

      {/* Answer Section */}
      {showAnswer && (
        <div className="mt-5 bg-blue-50 p-4 rounded">
          <p className="text-green-600 font-semibold">✅ Correct Answer: {correctAnswer}</p>
          {rationale && <p className="mt-2 text-gray-700">{rationale}</p>}
        </div>
      )}
    </div>
  );
}
