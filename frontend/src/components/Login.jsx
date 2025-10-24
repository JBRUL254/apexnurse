import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 simple local authentication logic
    // You can connect this to your backend if needed.
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Example call to your backend (optional)
      // const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, { ... })

      // For now, we’ll mock success login
      const user = { id: Date.now(), email };
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow p-8 rounded w-80">
        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">
          ApexNurse Login
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
