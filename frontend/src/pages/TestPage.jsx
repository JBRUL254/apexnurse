import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function TestPage() {
  const { paperId } = useParams(); // e.g. "Paper 1-Series 1"
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Decode paper and series
  const [paper, series] = decodeURIComponent(paperId).split("-");

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/questions?paper=${encodeURIComponent(
            paper
          )}&series=${encodeURIComponent(series)}`
        );
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [paperId]);

  const handleSelect = (qid, opt) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handleFinish = async () => {
    if (!user) return alert("Please log in first!");
    for (const q of questions) {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          question_id: q.id,
          selected_option: answers[q.id] || "",
          correct: answers[q.id] === q.correct_option,
        }),
      });
    }
    navigate("/performance");
  };

  if (loading) return <div className="p-10 text-center">Loading questions...</div>;
  if (!questions.length) return <div className="p-10 text-center">No questions found.</div>;

  const q = questions[current];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">
          {paper} - {series}
        </h2>
        <p className="text-gray-600 mb-4">
          Question {current + 1} of {questions.length}
        </p>

        <div className="mb-6">
          <p className="font-medium mb-4">{q?.question_text}</p>
          {["a", "b", "c", "d"].map((optKey) => {
            const optVal = q[`option_${optKey}`];
            return (
              optVal && (
                <label key={optKey} className="block mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={optKey.toUpperCase()}
                    checked={answers[q.id] === optKey.toUpperCase()}
                    onChange={() => handleSelect(q.id, optKey.toUpperCase())}
                    className="mr-2"
                  />
                  {optVal}
                </label>
              )
            );
          })}
        </div>

        <div className="flex justify-between">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
            className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
          >
            Previous
          </button>
          {current < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Finish Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
