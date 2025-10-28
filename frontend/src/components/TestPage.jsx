import React, { useState } from "react";

export default function TestPage({ questions, finishTest, paper, series, goBack }) {
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [feedback, setFeedback] = useState(null);

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

  function handleSelect(option) {
    if (showAnswer) return; // prevent changing after checking
    setSelectedAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  }

  function submitAnswer() {
    if (!selected) return;
    const correct = selected === correctAnswer;
    if (correct) {
      setScore((s) => s + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Incorrect! The correct answer is: ${correctAnswer}`);
    }
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setShowAnswer(false);
      setFeedback(null);
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
      setFeedback(null);
    }
  }

  function handleJumpTo(index) {
    setCurrent(index);
    setShowAnswer(false);
    setFeedback(null);
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

  // Progress bar
  const progress = ((current + 1) / total) * 100;

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

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded mb-4">
        <div
          className="h-2 bg-blue-500 rounded transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Confirm Exit Modal */}
      {confirmExit && (
        <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4">
              ⚠️ Are you sure you want to exit? Your progress will not be saved.
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

      {/* Question */}
      <p className="mb-3 font-medium text-gray-800">{questionText}</p>

      {/* Options with ✓ or ❌ */}
      <div className="flex flex-col gap-2">
        {cleanedOptions.map((opt, idx) => {
          let icon = "";
          if (showAnswer) {
            if (opt === correctAnswer) icon = "✅";
            else if (opt === selected && opt !== correctAnswer) icon = "❌";
          }

          return (
            <label
              key={idx}
              className={`border p-2 rounded cursor-pointer flex justify-between items-center ${
                selected === opt
                  ? "bg-blue-50 border-blue-400"
                  : "border-gray-200"
              }`}
            >
              <span>
                <input
                  type="radio"
                  name={`option-${current}`}
                  value={opt}
                  checked={selected === opt}
                  onChange={() => handleSelect(opt)}
                  className="mr-2"
                />
                {opt}
              </span>
              <span className="text-lg">{icon}</span>
            </label>
          );
        })}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className="mt-4 text-center text-gray-800 font-semibold">
          {feedback}
          {rationale && showAnswer && (
            <p className="mt-2 text-sm text-gray-600">{rationale}</p>
          )}
        </div>
      )}

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

      {showAnswer && (
        <div className="flex justify-between mt-6">
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
      )}
    </div>
  );
}
