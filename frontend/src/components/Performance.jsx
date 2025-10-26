import React from "react";

export default function Performance({ data, goHome }) {
  if (!data) return null;

  const { score, total, paper, series } = data;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">
        Test Complete ✅
      </h1>
      <p className="mb-1">Paper: {paper}</p>
      <p className="mb-1">Series: {series}</p>
      <p className="text-lg mb-4 font-semibold">
        Score: {score} / {total} ({((score / total) * 100).toFixed(1)}%)
      </p>
      <button
        onClick={goHome}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Back to Home
      </button>
    </div>
  );
}
