import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

type AuthState = "loading" | "unregistered" | "registered" | "logged_in";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    invoke<boolean>("check_registered")
      .then((registered) => {
        setAuthState(registered ? "registered" : "unregistered");
      })
      .catch(() => setAuthState("unregistered"));
  }, []);

  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authState === "unregistered" ? (
              <Navigate to="/register" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            authState === "unregistered" ? (
              <Register onRegistered={() => setAuthState("registered")} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login onLoggedIn={() => setAuthState("logged_in")} />} />
        <Route
          path="/dashboard"
          element={
            authState === "logged_in" ? (
              <Dashboard onLogout={() => setAuthState("registered")} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
