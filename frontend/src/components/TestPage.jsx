import React, { useState } from "react";

export default function TestPage({ questions, finishTest, paper, series, goBack }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const q = questions[current];

  if (!q)
    return (
      <div className="p-10 text-center">
        <p>No questions found.</p>
        <button
          onClick={goBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          ← Back
        </button>
      </div>
    );

  const questionText =
    q.question || q.question_text || q.text || "No question text found";

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
  const total = questions.length;
  const selected = selectedAnswers[current] || null;

  // -------------------------------
  // DeepSeek Reasoner Integration
  // -------------------------------
  async function askDeepSeek() {
    setLoadingAI(true);
    setAiResponse(null);
    try {
      const res = await fetch(
        `https://apexnurses-backend.onrender.com/reasoner?question=${encodeURIComponent(
          questionText
        )}`,
        { method: "GET" }
      );
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      setAiResponse({ answer: "⚠️ Unable to reach DeepSeek API.", rationale: "" });
    } finally {
      setLoadingAI(false);
    }
  }

  // -------------------------------

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
      setAiResponse(null);
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
      setAiResponse(null);
    }
  }

  function handleJumpTo(index) {
    setCurrent(index);
    setShowAnswer(false);
    setAiResponse(null);
  }

  function handleFinish() {
    finishTest(score, total);
  }

  function handleExit() {
    setConfirmExit(true);
  }

  function confirmExitAction(choice) {
    if (choice === "yes") goBack();
    setConfirmExit(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
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
            className="bg-yellow-500 text-white px-3 py-1 rounded"
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

      {/* Confirm Exit Modal */}
      {confirmExit && (
        <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4">
              ⚠️ Are you sure you want to exit? Your performance will not be
              saved.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => confirmExitAction("yes")}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Exit
              </button>
              <button
                onClick={() => confirmExitAction("no")}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation grid */}
      {showNav && (
        <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded border">
          {questions.map((_, idx) => {
            const answered = selectedAnswers[idx];
            return (
              <button
                key={idx}
                onClick={() => handleJumpTo(idx)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition ${
                  idx === current
                    ? "bg-blue-600 text-white"
                    : answered
                    ? "bg-green-400 text-white"
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

      {/* Options with Tick/X indicators */}
      <div className="flex flex-col gap-2">
        {cleanedOptions.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = showAnswer && opt === correctAnswer;
          const isWrong = showAnswer && isSelected && opt !== correctAnswer;

          return (
            <label
              key={idx}
              className={`flex items-center justify-between border p-2 rounded cursor-pointer ${
                isCorrect
                  ? "bg-green-50 border-green-500"
                  : isWrong
                  ? "bg-red-50 border-red-500"
                  : isSelected
                  ? "bg-blue-50 border-blue-400"
                  : "border-gray-200"
              }`}
            >
              <div>
                <input
                  type="radio"
                  name={`option-${current}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => handleSelect(opt)}
                  className="mr-2"
                  disabled={showAnswer}
                />
                {opt}
              </div>

              {showAnswer && (
                <span className="ml-3 text-xl">
                  {isCorrect ? "✅" : isWrong ? "❌" : ""}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* DeepSeek Reasoner Button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={askDeepSeek}
          disabled={loadingAI}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M2 12c4-4 10-8 20-8-3 4-3 10 0 14-10 0-16-4-20-8zM4 12a8 8 0 0016 0 8 8 0 00-16 0z" />
          </svg>
          {loadingAI ? "Thinking..." : "Ask DeepSeek"}
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-4 bg-purple-50 border border-purple-300 p-4 rounded">
          <h4 className="font-semibold text-purple-700 mb-1">
            🧠 DeepSeek Response:
          </h4>
          <p>
            <strong>Answer:</strong> {aiResponse.answer}
          </p>
          {aiResponse.rationale && (
            <p className="mt-2 text-gray-700">
              <strong>Reason:</strong> {aiResponse.rationale}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
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

      {/* Correct Answer + Explanation */}
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
    </div>
  );
}
