import React, { useState } from "react";
import axios from "axios";

export default function TestPage({ questions, finishTest, paper, series, goBack, user }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const selected = selectedAnswers[current] || null;

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
  const correctAnswer = q.correct_answer || q.answer || q.correct || "";
  const rationale = q.rationale || q.explanation || "";

  const handleSelect = (opt) => {
    setSelectedAnswers((prev) => ({ ...prev, [current]: opt }));
  };

  const submitAnswer = () => {
    if (!selected) return;
    if (selected === correctAnswer) setScore((s) => s + 1);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
    }
  };

  const handleFinish = async () => {
    const result = { user_id: user?.id || "guest", paper, series, score, total };
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "https://apexnurses.onrender.com"}/performance`, result);
    } catch (err) {
      console.error("Error saving performance:", err);
    }
    setFinished(true);
  };

  if (finished)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Test Complete ✅</h1>
        <p>Paper: {paper}</p>
        <p>Series: {series}</p>
        <p className="text-lg font-semibold mt-3">
          Score: {score} / {total} ({((score / total) * 100).toFixed(1)}%)
        </p>
        <button onClick={goBack} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
          Back to Dashboard
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6 mb-10">
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

      {showNav && (
        <div className="grid grid-cols-8 gap-2 mb-4 p-2 bg-gray-50 rounded border">
          {questions.map((_, idx) => {
            const answered = selectedAnswers[idx];
            return (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition 
                  ${
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
              checked={selected === opt}
              onChange={() => handleSelect(opt)}
              className="mr-2"
            />
            {opt}
          </label>
        ))}
      </div>

      {!showAnswer ? (
        <div className="flex justify-between mt-6">
          <button onClick={prevQuestion} disabled={current === 0} className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50">
            ← Previous
          </button>
          <button onClick={submitAnswer} className="bg-green-600 text-white px-4 py-2 rounded">
            Check Answer
          </button>
          <button onClick={nextQuestion} disabled={current === total - 1} className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50">
            Next →
          </button>
        </div>
      ) : (
        <div className="mt-5 bg-blue-50 p-4 rounded">
          <p className="text-green-600 font-semibold">✅ Correct Answer: {correctAnswer}</p>
          {rationale && <p className="mt-2 text-gray-700">{rationale}</p>}
          <div className="flex justify-between mt-4">
            <button onClick={prevQuestion} disabled={current === 0} className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50">
              ← Previous
            </button>
            <button onClick={nextQuestion} className="bg-blue-600 text-white px-4 py-2 rounded">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
