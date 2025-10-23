import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TestPage from "./pages/TestPage";
import Performance from "./pages/Performance";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/test/:paperId" element={<TestPage />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

