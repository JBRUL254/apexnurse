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
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${backendURL}/questions`, {
          params: { paper, series },
        });

        if (Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          setError("No questions found for this paper or series.");
        }
      } catch (err) {
        console.error("❌ Error fetching questions:", err);
        setError("Failed to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paper, series, backendURL]);

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const handleCheckAnswer = () => setShowAnswer(true);

  if (loading)
    return (
      <div className="text-center mt-10 text-blue-600 font-semibold">
        Loading questions...
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        {error}
      </div>
    );

  if (!questions || questions.length === 0)
    return (
      <div className="text-center mt-10 text-gray-600">
        No questions available.
      </div>
    );

  const q = questions[current];
  const options = q?.options
    ? q.options
    : [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean); // fallback if options are separate fields

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Question {current + 1} of {questions.length}
      </h2>

      <p className="text-lg mb-6">{q?.question_text || "No question text"}</p>

      <div className="space-y-3">
        {Array.isArray(options) && options.length > 0 ? (
          options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(option)}
              className={`w-full text-left px-4 py-2 border rounded-lg transition ${
                selected === option
                  ? "bg-blue-100 border-blue-600"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))
        ) : (
          <p className="text-gray-500 italic">No options available</p>
        )}
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
        <div className="mt-5 p-4 bg-green-50 border border-green-500 rounded-lg">
          <p>
            <strong>Answer:</strong> {q?.correct_answer || "Not provided"}
          </p>
          {q?.rationale && (
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
