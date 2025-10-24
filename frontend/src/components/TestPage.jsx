import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

const TestPage = () => {
  const { paper, series } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .ilike("paper", paper)
          .ilike("series", `%${series}%`)
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          console.warn("⚠️ No questions found.");
          setQuestions([]);
        }
      } catch (err) {
        console.error("❌ Error loading questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paper, series]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const currentQuestion = questions[currentIndex];
    const correct = selectedOption.trim().toLowerCase() === currentQuestion.correct_option?.trim().toLowerCase();

    if (correct) setScore((prev) => prev + 1);
    setShowAnswer(true);
  };

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

  const handleFinish = () => {
    navigate(`/summary?score=${score}&total=${questions.length}&paper=${paper}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading questions...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-500">
        No questions found for this paper and series.
      </div>
    );
  }

  const q = questions[currentIndex];

  // ✅ Remove "Answer:" from question text automatically
  const rawQuestion =
    q.question || q.question_text || q.text || "No question text found";
  const questionText = rawQuestion.replace(/Answer:.*/i, "").trim();

  const options = [
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
  ].filter(Boolean);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {paper} – {series} ({currentIndex + 1}/{questions.length})
          </h2>
          <button
            onClick={handleFinish}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Finish Test
          </button>
        </div>

        <div className="text-gray-800 text-lg font-medium mb-4">
          {questionText}
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center border p-3 rounded-lg cursor-pointer transition ${
                selectedOption === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <input
                type="radio"
                name="option"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleOptionSelect(option)}
                className="mr-3"
              />
              {option}
            </label>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="bg-gray-200 px-4 py-2 rounded text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            ← Previous
          </button>

          {!showAnswer ? (
            <button
              onClick={handleCheckAnswer}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
              disabled={!selectedOption}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            >
              Next →
            </button>
          )}
        </div>

        {showAnswer && (
          <div className="mt-4 p-4 bg-green-50 border border-green-400 rounded-lg text-green-800">
            <p className="font-semibold">
              ✅ Correct Answer: {q.correct_option || "N/A"}
            </p>
            {q.rationale && (
              <p className="mt-2 text-gray-700">
                💡 Rationale: {q.rationale}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
