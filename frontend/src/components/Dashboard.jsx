import React from "react";

export default function Dashboard({ papers, loadSeries, selectedPaper, series, startTest, completedPapers }) {
  return (
    <div className="py-10 px-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">📘 ApexNurse Dashboard</h1>

      {!selectedPaper ? (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Select a Paper to Begin</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {papers.map((p) => (
              <button
                key={p}
                onClick={() => loadSeries(p)}
                className={`p-6 rounded-lg shadow hover:shadow-md transition ${
                  completedPapers?.includes(p)
                    ? "bg-green-100 border-2 border-green-400"
                    : "bg-white border"
                }`}
              >
                <p className="font-medium text-lg">{p}</p>
                {completedPapers?.includes(p) && (
                  <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                )}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            Choose a Series for <span className="text-blue-600">{selectedPaper}</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {series.map((s) => (
              <button key={s} onClick={() => startTest(s)} className="p-5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                {s}
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <button onClick={() => window.location.reload()} className="text-gray-600 hover:text-blue-600 underline">
              ← Back to Papers
            </button>
          </div>
        </>
      )}
    </div>
  );
}
