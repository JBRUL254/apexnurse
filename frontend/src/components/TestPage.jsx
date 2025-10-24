import React, { useState } from "react";

export default function TestPage({ questions, finishTest, paper, series, goBack }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // ✅ store selections per question
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
  const selected = selectedAnswers[current] || null;

  function handleSelect(option) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [current]: option, // ✅ store selection only for current question
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
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
    }
  }

  function handleFinish() {
    finishTest(score, total);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10">
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

      <p className="mb-3 font-medium">{questionText}</p>

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
              name={`option-${current}`} // ✅ unique group per question
              value={opt}
              checked={selected === opt}
              onChange={() => handleSelect(opt)}
              className="mr-2"
            />
            {opt}
          </label>
        ))}
      </div>

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
