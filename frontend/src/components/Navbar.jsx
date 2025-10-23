import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-white shadow px-6 py-3 sticky top-0 z-50">
      <h1
        onClick={() => navigate("/dashboard")}
        className="font-bold text-xl text-blue-700 cursor-pointer"
      >
        ApexNurse
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="text-gray-600 hover:text-blue-600"
        >
          ⚙️
        </button>
        <button
          onClick={() => navigate("/performance")}
          className="text-gray-600 hover:text-blue-600"
        >
          📊
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
