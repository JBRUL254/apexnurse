import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Performance() {
  const [attempts, setAttempts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);
      const { data, error } = await supabase
        .from("attempts")
        .select("*, questions(question_text,paper,series)")
        .eq("user_id", userData?.user?.id);
      if (!error) setAttempts(data || []);
    };
    load();
  }, []);

  if (!user) return <div className="p-10 text-center">Login required</div>;
  if (attempts.length === 0) return <div className="p-10 text-center">No attempts yet</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Your Performance</h1>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        {attempts.map((a, i) => (
          <div key={i} className="border-b py-3">
            <p className="font-medium">{a.questions.question_text}</p>
            <p className="text-sm text-gray-600">
              Paper: {a.questions.paper} | Series: {a.questions.series}
            </p>
            <p
              className={`text-sm font-semibold ${
                a.correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {a.correct ? "Correct" : "Incorrect"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
