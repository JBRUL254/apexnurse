import React from "react";

export default function Dashboard({
  papers,
  loadSeries,
  selectedPaper,
  series,
  startTest,
}) {
  function handleRandomPractice() {
    startTest("practice-random");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 text-center mb-8">
        🩺 ApexNurse Practice Dashboard
      </h1>

      {/* Step 1 — Choose Paper */}
      {!selectedPaper ? (
        <>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">
            Select a Paper to Begin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {papers.map((p) => (
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
          {/* Step 2 — Series & Quicktests */}
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

            {/* Series Section */}
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

            {/* Quicktests Section */}
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

            {/* Random Practice Mode */}
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
