import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TestPage({ paper, series, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL || "https://apexnurse-backend.onrender.com";

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const res = await axios.get(`${backendURL}/questions`, {
          params: { paper, series },
        });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          setError("No questions found for this paper or series.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [paper, series, backendURL]);

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const handleCheckAnswer = () => setShowAnswer(true);

  if (loading) return <div className="text-center mt-10">Loading questions...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!questions.length) return <div className="text-center mt-10">No questions available.</div>;

  const q = questions[current];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Question {current + 1} of {questions.length}
      </h2>

      <p className="text-lg mb-6">{q.question_text}</p>

      <div className="space-y-3">
        {q.options &&
          q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(option)}
              className={`w-full text-left px-4 py-2 border rounded-lg ${
                selected === option
                  ? "bg-blue-100 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        {!showAnswer && selected && (
          <button
            onClick={handleCheckAnswer}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Check Answer
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={current === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showAnswer && (
        <div className="mt-4 p-4 bg-green-50 border border-green-400 rounded-lg">
          <p>
            <strong>Answer:</strong> {q.correct_answer}
          </p>
          {q.rationale && (
            <p className="mt-2 text-gray-700">
              <strong>Rationale:</strong> {q.rationale}
            </p>
          )}
        </div>
      )}

      {current === questions.length - 1 && (
        <button
          onClick={onFinish}
          className="mt-8 w-full py-3 bg-purple-600 text-white rounded-lg font-semibold"
        >
          Finish Test
        </button>
      )}
    </div>
  );
}
