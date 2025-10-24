import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function TestPage() {
  const { paper, series } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [testFinished, setTestFinished] = useState(false);

  // ✅ Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("paper", paper)
          .eq("series", series);

        if (error) throw error;
        if (!data || data.length === 0) {
          setErrorMsg("No questions found for this test.");
          setQuestions([]);
        } else {
          setQuestions(data);
          setErrorMsg("");
        }
      } catch (err) {
        console.error("Error loading questions:", err);
        setErrorMsg("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paper, series]);

  // ✅ Event Handlers
  const handleOptionClick = (option) => {
    if (showAnswer) return; // prevent changing after checking
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return alert("Please select an answer first!");
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestionState();
    } else {
      setTestFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handleFinish = () => {
    alert("Test finished! Redirecting to performance page...");
    navigate("/performance");
  };

  // ✅ UI Rendering
  if (loading) return <div className="p-6 text-center text-gray-500">Loading questions...</div>;
  if (errorMsg) return <div className="p-6 text-center text-red-500">{errorMsg}</div>;
  if (testFinished)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">🎉 Test Completed!</h2>
        <button
          onClick={() => navigate("/performance")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          View Performance
        </button>
      </div>
    );

  const q = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {paper} - {series}
        </h2>
        <p className="text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {q ? (
        <>
          <h3 className="text-lg font-bold mb-4">{q.question}</h3>
          <div className="space-y-3">
            {["option_a", "option_b", "option_c", "option_d"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleOptionClick(q[opt])}
                className={`block w-full text-left p-3 rounded-lg border ${
                  selectedOption === q[opt]
                    ? "bg-blue-100 border-blue-400"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {q[opt]}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            {!showAnswer && (
              <button
                onClick={handleCheckAnswer}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Check Answer
              </button>
            )}

            {showAnswer && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200 mt-4 w-full">
                <p className="text-green-700 font-semibold">
                  ✅ Correct Answer: {q.correct_answer}
                </p>
                {q.rationale && (
                  <p className="mt-2 text-gray-700">
                    <strong>Rationale:</strong> {q.rationale}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Finish Test
              </button>
            )}
          </div>
        </>
      ) : (
        <div>No question data found.</div>
      )}
    </div>
  );
}
