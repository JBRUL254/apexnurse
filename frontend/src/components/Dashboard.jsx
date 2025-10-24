import React from "react";

export default function Dashboard({ papers, loadSeries, selectedPaper, series, startTest }) {
  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">ApexNurse Dashboard</h1>

      {!selectedPaper ? (
        <>
          <h2 className="text-xl mb-3">Select a Paper</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {papers.map((p) => (
              <button
                key={p}
                onClick={() => loadSeries(p)}
                className="bg-white shadow px-4 py-2 rounded hover:bg-blue-50"
              >
                {p}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl mb-3">Select a Series for {selectedPaper}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {series.map((s) => (
              <button
                key={s}
                onClick={() => startTest(s)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-gray-500 hover:text-blue-600"
          >
            ← Back to Papers
          </button>
        </>
      )}
    </div>
  );
}

