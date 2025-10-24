import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TestPage({ paper, series, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions from backend
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/questions`,
          {
            params: { paper, series },
          }
        );

        if (Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          setQuestions([]);
          setError("No questions found for this paper/series.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [paper, series]);

  // Avoid .map errors
  if (loading) return <div className="text-center mt-10">Loading questions...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!questions || questions.length === 0)
    return <div className="text-center mt-10 text-gray-500">No questions found.</div>;

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handleFinish = () => {
    if (onFinish) onFinish();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-xl mt-8">
      <h2 className="text-lg font-semibold mb-4">
        {paper} — {series}
      </h2>

      <div className="mb-4">
        <p className="text-gray-700 mb-3">
          <strong>Q{currentIndex + 1}:</strong> {currentQuestion.question}
        </p>
        <div className="space-y-2">
          {currentQuestion.options?.map((opt, i) => (
            <label
              key={i}
              className={`block p-2 border rounded cursor-pointer ${
                selectedOption === opt
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={opt}
                checked={selectedOption === opt}
                onChange={() => setSelectedOption(opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>

        {showAnswer && (
          <div className="mt-4 text-green-600">
            ✅ Correct Answer: {currentQuestion.correct_answer}
            <p className="text-gray-600 mt-1 italic">
              💡 Rationale: {currentQuestion.rationale || "No rationale provided."}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {!showAnswer ? (
          <button
            onClick={handleCheckAnswer}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        )}
        {currentIndex === questions.length - 1 && (
          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-green-600 text-white rounded ml-2"
          >
            Finish Test
          </button>
        )}
      </div>
    </div>
  );
}
