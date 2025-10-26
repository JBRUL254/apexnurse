import React, { useState } from "react";
import axios from "axios";

export default function TestPage({ questions, finishTest, paper, series, goBack, user }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
    q.option_a, q.option_b, q.option_c, q.option_d
  ].filter(Boolean).map(opt => opt.replace(/Answer:.*/i, "").trim());

  const correctAnswer = q.correct_answer || q.answer || q.correct || "";
  const rationale = q.rationale || q.explanation || "";
  const total = questions.length;
  const selected = selectedAnswers[current] || null;

  function handleSelect(option) {
    setSelectedAnswers(prev => ({ ...prev, [current]: option }));
  }

  function submitAnswer() {
    if (!selected) return;
    if (selected === correctAnswer) setScore(s => s + 1);
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setShowAnswer(false);
    }
  }

  async function handleFinish() {
    if (user && user.id) {
      await axios.post(`${import.meta.env.VITE_API_URL}/performance`, {
        user_id: user.id,
        paper,
        series,
        score,
        total,
      }).catch(console.error);
    }
    finishTest(score, total);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {paper} – {series} ({current + 1}/{total})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Exit Early
          </button>
          <button onClick={handleFinish} className="bg-red-500 text-white px-3 py-1 rounded">
            Finish Test
          </button>
        </div>
      </div>

      <p className="mb-3 font-medium text-gray-800">{questionText}</p>

      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => (
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

      {!showAnswer && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrent(c => Math.max(c - 1, 0))}
            disabled={current === 0}
            className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
          >
            ← Previous
          </button>
          <button onClick={submitAnswer} className="bg-green-600 text-white px-4 py-2 rounded">
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
          <div className="flex justify-end mt-4">
            <button onClick={nextQuestion} className="bg-blue-600 text-white px-4 py-2 rounded">
              Next →
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="mb-4 font-semibold">
              Are you sure you want to exit? Performance will not be saved.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => goBack()}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Exit
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
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
