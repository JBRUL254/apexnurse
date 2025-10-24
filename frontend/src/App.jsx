import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const current = localStorage.getItem("user_id");
    if (current) {
      setUser({ id: current });
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div>
      <nav className="p-4 bg-blue-600 text-white flex justify-between">
        <span>Apex Nurse</span>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
          Logout
        </button>
      </nav>
      <Dashboard user={user} />
    </div>
  );
}

export default App;
