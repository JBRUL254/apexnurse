import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TestPage from "./pages/TestPage";
import Performance from "./pages/Performance";
import "./index.css";

// Optional: If you have a login page, import it here
// import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home / Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Dynamic test route — Paper & Series */}
        <Route path="/test/:paperId" element={<TestPage />} />

        {/* Past results */}
        <Route path="/performance" element={<Performance />} />

        {/* Optional login page */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Render the root app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
