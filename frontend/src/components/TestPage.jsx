import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TestPage({ user, questions, paper, series, testType, goBack, finishTest }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL || "https://your-backend-url.onrender.com";

  // --- limit question count automatically ---
  const limit = testType === "quicktest" ? 60 : 120;
  const limitedQuestions = questions.slice(0, limit);

  const q = limitedQuestions[current];
  const total = limitedQuestions.length;

  if (!q)
    return (
      <div className="p-10 text-center">
        <p>No questions found for this test.</p>
        <button
          onClick={goBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          ← Back
        </button>
      </div>
    );

  // --- normalize question fields ---
  const questionText =
    q.question || q.question_text || q.text || "Question not found";

  const options = [
    q.option_a || q.opt1 || q.option1,
    q.option_b || q.opt2 || q.option2,
    q.option_c || q.opt3 || q.option3,
    q.option_d || q.opt4 || q.option4,
  ].filter(Boolean);

  const cleanedOptions = options.map((opt) =>
    opt.replace(/Answer:.*/i, "").trim()
  );

  const correctAnswer = q.correct_answer || q.answer || q.correct || "";
  const rationale = q.rationale || q.explanation || "";

  const selected = selectedAnswers[current] || null;

  // --- handle selection ---
  function handleSelect(option) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  }

  // --- handle checking ---
  function submitAnswer() {
    if (!selected) return;
    const correct = selected === correctAnswer;
    if (correct) setScore((s) => s + 1);
    setShowAnswer(true);
  }

  // --- navigation controls ---
  function nextQuestion() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowAnswer(false);
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
    }
  }

  function handleJumpTo(index) {
    setCurrent(index);
    setShowAnswer(false);
  }

  // --- early exit ---
  function handleExit() {
    setShowExitConfirm(true);
  }

  function confirmExit(yes) {
    setShowExitConfirm(false);
    if (yes) goBack();
  }

  // --- save performance when finishing ---
  async function handleFinish() {
    try {
      await axios.post(`${BASE_URL}/performance`, {
        user_id: user?.id || "anonymous",
        paper,
        series,
        score,
        total,
      });
    } catch (err) {
      console.error("Failed to save performance:", err);
    } finally {
      finishTest({ score, total, paper, series });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {paper} – {series} ({current + 1}/{total})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNav(!showNav)}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            ☰
          </button>
          <button
            onClick={handleExit}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Exit Early
          </button>
          <button
            onClick={handleFinish}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Finish Test
          </button>
        </div>
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded border">
          {limitedQuestions.map((_, idx) => {
            const answered = selectedAnswers[idx];
            return (
              <button
                key={idx}
                onClick={() => handleJumpTo(idx)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition 
                  ${
                    idx === current
                      ? "bg-blue-600 text-white"
                      : answered
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

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

      {/* Buttons */}
      {!showAnswer && (
        <div className="flex justify-between mt-6">
          <button
            onClick={prevQuestion}
            disabled={current === 0}
            className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
          >
            ← Previous
          </button>

          <button
            onClick={submitAnswer}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Check Answer
          </button>

          <button
            onClick={nextQuestion}
            disabled={current === total - 1}
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Answer & Rationale */}
      {showAnswer && (
        <div className="mt-5 bg-blue-50 p-4 rounded">
          <p className="text-green-600 font-semibold">
            ✅ Correct Answer: {correctAnswer}
          </p>
          {rationale && <p className="mt-2 text-gray-700">{rationale}</p>}
          <div className="flex justify-between mt-4">
            <button
              onClick={prevQuestion}
              disabled={current === 0}
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={nextQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next Question →
            </button>
          </div>
        </div>
      )}

      {/* Exit confirmation popup */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm mx-auto">
            <p className="mb-4 text-gray-700 font-semibold">
              Confirm you want to exit? Performance will not be saved.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => confirmExit(true)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Exit
              </button>
              <button
                onClick={() => confirmExit(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No, Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
