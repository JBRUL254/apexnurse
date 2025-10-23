import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTest } from "../context/TestContext";
import { useNavigate } from "react-router-dom";

export default function Practice() {
  const { activeTest } = useTest();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!activeTest) {
      navigate("/home");
      return;
    }
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/questions/${activeTest.paper}/${activeTest.series}`
    )
      .then((r) => r.json())
      .then(setQuestions)
      .catch(console.error);
  }, [activeTest]);

  useEffect(() => {
    const t = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleAnswer = (qid, opt) => {
    setAnswers({ ...answers, [qid]: opt });
  };

  const handleNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const finishTest = async () => {
    const score = questions.filter(
      (q) => answers[q.id] && answers[q.id] === q.correct_answer
    ).length;

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        paper: activeTest.paper,
        series: activeTest.series,
        score,
        total: questions.length,
        accuracy: (score / questions.length) * 100,
        time_spent_seconds: timer,
      }),
    });
    navigate("/summary", { state: { score, total: questions.length } });
  };

  if (!questions.length)
    return <div className="p-6 text-center">Loading questions...</div>;

  const q = questions[index];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {activeTest.paper} - {activeTest.series}
      </h2>
      <div className="mb-4 flex justify-between items-center">
        <span>Question {index + 1} / {questions.length}</span>
        <span>⏱️ {timer}s</span>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="font-medium mb-3">{q.question}</p>
        {["A", "B", "C", "D"].map((opt) => (
          q[`option_${opt.toLowerCase()}`] && (
            <label key={opt} className="block mb-2">
              <input
                type="radio"
                name={`q${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => handleAnswer(q.id, opt)}
                className="mr-2"
              />
              {opt}. {q[`option_${opt.toLowerCase()}`]}
            </label>
          )
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        {index < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finishTest}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Finish Test
          </button>
        )}
      </div>
    </div>
  );
}
