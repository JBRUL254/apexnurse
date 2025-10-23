import { useLocation, useNavigate } from "react-router-dom";

export default function TestSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { score, total } = state || { score: 0, total: 0 };
  const accuracy = ((score / total) * 100).toFixed(1);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Test Completed ✅</h1>
      <p className="text-lg mb-2">Score: {score} / {total}</p>
      <p className="text-lg mb-6">Accuracy: {accuracy}%</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Next Test
        </button>
        <button
          onClick={() => navigate("/performance")}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          View Performance
        </button>
      </div>
    </div>
  );
}
