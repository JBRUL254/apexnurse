import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [papers, setPapers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);

      const { data, error } = await supabase
        .from("questions")
        .select("paper, series")
        .order("paper", { ascending: true });

      if (error) console.error(error);
      else {
        // Group by paper and series
        const grouped = {};
        data.forEach((row) => {
          if (!grouped[row.paper]) grouped[row.paper] = new Set();
          grouped[row.paper].add(row.series);
        });

        const formatted = {};
        Object.keys(grouped).forEach((paper) => {
          formatted[paper] = Array.from(grouped[paper]);
        });

        setPapers(formatted);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Welcome to ApexNurse
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Choose a Paper & Series to begin your test
      </p>

      {Object.keys(papers).map((paperName) => (
        <div key={paperName} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{paperName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {papers[paperName].map((seriesName, i) => (
              <div
                key={i}
                onClick={() => navigate(`/test/${encodeURIComponent(paperName)}-${encodeURIComponent(seriesName)}`)}
                className="p-5 bg-white rounded-2xl shadow hover:shadow-lg cursor-pointer transition border border-gray-200"
              >
                <h3 className="font-semibold text-lg text-gray-800">{seriesName}</h3>
                <p className="text-sm text-gray-500">Click to start this test</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => navigate("/performance")}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          View Performance
        </button>
      </div>
    </div>
  );
}
