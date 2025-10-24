// src/components/TestPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TestPage() {
  const { paper, series } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/questions?paper=${paper}&series=${series}`
        );
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Error loading questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [paper, series]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading questions...</div>;
  if (questions.length === 0) return <div className="p-6 text-center text-red-500">No questions found.</div>;

  const q = questions[current];

  const checkAnswer = () => setShowAnswer(true);
  const nextQuestion = () => {
    setShowAnswer(false);
    setSelected(null);
    if (current < questions.length - 1) setCurrent(current + 1);
  };
  const prevQuestion = () => {
    setShowAnswer(false);
    setSelected(null);
    if (current > 0) setCurrent(current - 1);
  };
  const finishTest = () => navigate("/performance");

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">
        {paper} — {series.replace(/_/g, " ")}
      </h2>

      <p className="text-gray-800 mb-3">
        {q.question || "Question not found."}
      </p>

      <div className="space-y-2">
        {["A", "B", "C", "D"].map((opt) => (
          <label key={opt} className={`block p-2 border rounded cursor-pointer ${
              selected === opt ? "bg-blue-100 border-blue-400" : "hover:bg-gray-50"
            }`}>
            <input
              type="radio"
              name="answer"
              value={opt}
              checked={selected === opt}
              onChange={() => setSelected(opt)}
              className="mr-2"
            />
            {q[`option_${opt.toLowerCase()}`]}
          </label>
        ))}
      </div>

      {!showAnswer && (
        <button
          onClick={checkAnswer}
          disabled={!selected}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Check Answer
        </button>
      )}

      {showAnswer && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500">
          <p className="text-green-700 font-semibold">Correct Answer: {q.answer}</p>
          <p className="text-gray-700 mt-1">{q.rationale || "No rationale provided."}</p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={prevQuestion}
          disabled={current === 0}
          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
        >
          Previous
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={nextQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finishTest}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            Finish Test
          </button>
        )}
      </div>
    </div>
  );
}

export default TestPage;
