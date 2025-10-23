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
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./styles/globals.css";

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route
                path="/dashboard"
                element={<Layout><Dashboard /></Layout>}
              />
              <Route
                path="/home"
                element={<Layout><Home /></Layout>}
              />
              <Route
                path="/practice"
                element={<Layout><Practice /></Layout>}
              />
              <Route
                path="/performance"
                element={<Layout><Performance /></Layout>}
              />
              <Route
                path="/summary"
                element={<Layout><TestSummary /></Layout>}
              />
              <Route
                path="/settings"
                element={<Layout><Settings /></Layout>}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </TestProvider>
    </AuthProvider>
  );
}
