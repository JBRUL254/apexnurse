import React, { useState } from "react";

export default function TestPage({ questions, finishTest, paper, series, goBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);

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

  // --- Handle flexible field names ---
  const questionText = q.question || q.question_text || q.text || "No question text found";
  const options = [
    q.option_a || q.opt1 || q.option1,
    q.option_b || q.opt2 || q.option2,
    q.option_c || q.opt3 || q.option3,
    q.option_d || q.opt4 || q.option4,
  ].filter(Boolean);
  const correctAnswer = q.correct_answer || q.answer || q.correct || "";
  const rationale = q.rationale || q.explanation || "";

  const total = questions.length;

  function handleCheckAnswer() {
    if (!selected) return;
    const correct = selected === correctAnswer;
    if (correct) setScore((s) => s + 1);
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setSelected(null);
      setShowAnswer(false);
    }
  }

  function handleFinish() {
    finishTest(score, total);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
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
            onClick={handleFinish}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Finish Test
          </button>
        </div>
      </div>

      {/* Navigation grid */}
      {showNav && (
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`px-3 py-1 rounded ${
                idx === current ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Question */}
      <p className="mb-3 font-medium">{questionText}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => (
          <label
            key={idx}
            className={`border p-2 rounded cursor-pointer ${
              selected === opt ? "bg-blue-50 border-blue-400" : ""
            }`}
          >
            <input
              type="radio"
              name="option"
              value={opt}
              checked={selected === opt}
              onChange={(e) => setSelected(e.target.value)}
              className="mr-2"
            />
            {opt}
          </label>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevQuestion}
          disabled={current === 0}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          ← Previous
        </button>

        {!showAnswer && (
          <button
            onClick={handleCheckAnswer}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Check Answer
          </button>
        )}

        <button
          onClick={nextQuestion}
          disabled={current === total - 1}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Answer & Rationale (only after Check Answer) */}
      {showAnswer && (
        <div className="mt-5 bg-blue-50 p-4 rounded">
          <p className="text-green-600 font-semibold">
            ✅ Correct Answer: {correctAnswer}
          </p>
          {rationale && <p className="mt-2 text-gray-700">{rationale}</p>}
        </div>
      )}
    </div>
  );
}
