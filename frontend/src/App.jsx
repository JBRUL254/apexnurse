import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TestProvider } from "./context/TestContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Performance from "./pages/Performance";
import TestSummary from "./pages/TestSummary";
import Settings from "./pages/Settings";
import PrivateRoute from "./routes/PrivateRoute";
import "./styles/globals.css";

export default function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/home" element={<Home />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/summary" element={<TestSummary />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TestProvider>
    </AuthProvider>
  );
}
