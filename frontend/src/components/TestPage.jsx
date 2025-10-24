import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://apexnurses-backend.onrender.com";

const TestPage = ({ selectedSeries, onFinish }) => {
  const [questions, setQuestions] = useState([]); // ✅ Always initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const paper = selectedSeries?.startsWith("Paper2") ? "Paper2" : "Paper1";
        const response = await axios.get(`${API_BASE_URL}/questions`, {
          params: { paper, series: selectedSeries },
        });

        if (response.data && Array.isArray(response.data.questions)) {
          setQuestions(response.data.questions);
        } else {
          setQuestions([]);
          setError("No questions found for this paper or series.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedSeries]);

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handleCheckAnswer = () => setShowAnswer(true);

  // ✅ UI safety guards
  if (loading) return <div className="text-center p-10 text-lg">Loading questions...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!questions || questions.length === 0)
    return <div className="text-center p-10 text-gray-600">No questions available.</div>;

  return (
    <div className="p-4 sm:p-8 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">
          {selectedSeries} ({currentIndex + 1}/{questions.length})
        </h2>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={onFinish}
        >
          Finish Test
        </button>
      </div>

      <p className="font-medium text-lg mb-4">{currentQuestion.question_text}</p>

      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => (
          <label
            key={index}
            className={`block p-3 border rounded cursor-pointer transition ${
              selectedOption === option ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="answer"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          ← Previous
        </button>

        <button
          onClick={handleCheckAnswer}
          disabled={!selectedOption}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Answer
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next →
        </button>
      </div>

      {showAnswer && (
        <div className="mt-4 p-4 border-t">
          <p className="font-semibold text-green-600">
            ✅ Correct Answer: {currentQuestion.correct_answer}
          </p>
          {currentQuestion.rationale && (
            <p className="text-gray-700 mt-2">💡 {currentQuestion.rationale}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPage;
