import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard({ papers, loadSeries, selectedPaper, series, startTest }) {
  const [filter, setFilter] = useState("");
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("performance") || "[]");
    setPerformance(saved.slice(0, 10));
  }, []);

  function handleRandomPractice() {
    startTest("practice-random");
  }

  const filteredPapers = papers.filter((p) =>
    p.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 text-center mb-8">
        🩺 ApexNurse Practice Dashboard
      </h1>

      {/* Search bar */}
      {!selectedPaper && (
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="🔍 Search papers..."
            className="border dark:border-gray-700 rounded-lg px-4 py-2 w-64 dark:bg-gray-800 dark:text-gray-200"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      )}

      {/* Performance Chart */}
      {performance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200 text-center">
            📈 Recent Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performance.reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={(d) => (d.score / d.total) * 100}
                stroke="#3b82f6"
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Papers or Series */}
      {!selectedPaper ? (
        <>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">
            Select a Paper to Begin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {filteredPapers.map((p) => (
              <div
                key={p}
                onClick={() => loadSeries(p)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {p}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Includes full-length series and quick tests.
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {selectedPaper} – Available Tests
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Papers
              </button>
            </div>

            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              📘 Series (120 Questions each)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {series
                .filter((s) => s.toLowerCase().includes("series"))
                .map((s) => (
                  <div
                    key={s}
                    className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {s}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      120 Questions | Full-length Series
                    </p>
                    <button
                      onClick={() => startTest(s)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
                    >
                      Start Test
                    </button>
                  </div>
                ))}
            </div>

            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              ⚡ Quick Tests (60 Questions each)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {series
                .filter((s) => s.toLowerCase().includes("quicktest"))
                .map((s) => (
                  <div
                    key={s}
                    className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {s}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      60 Questions | Short Practice Test
                    </p>
                    <button
                      onClick={() => startTest(s)}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
                    >
                      Start Quick Test
                    </button>
                  </div>
                ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={handleRandomPractice}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition-all"
              >
                🌀 Practice Random 20 Questions
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                A mix of questions from all papers for spontaneous learning.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
