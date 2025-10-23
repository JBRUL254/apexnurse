import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTest } from "../context/TestContext";

export default function Home() {
  const [papers, setPapers] = useState([]);
  const navigate = useNavigate();
  const { setActiveTest } = useTest();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/papers`)
      .then((r) => r.json())
      .then(setPapers)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Choose Your Paper & Series</h2>
      <div className="grid gap-4">
        {papers.map((p) => (
          <div key={p.paper} className="border p-4 rounded-lg shadow">
            <h3 className="font-bold text-xl mb-3">{p.paper.toUpperCase()}</h3>
            <div className="flex gap-2 flex-wrap">
              {p.series.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setActiveTest({ paper: p.paper, series: s });
                    navigate("/practice");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
