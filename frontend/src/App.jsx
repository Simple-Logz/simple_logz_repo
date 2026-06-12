import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Landing     from "./pages/Landing.jsx";
import About       from "./pages/About.jsx";
import Projects    from "./pages/Projects.jsx";
import Login       from "./pages/Login.jsx";
import Signup      from "./pages/Signup.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

import Pricing     from "./pages/Pricing.jsx";
import Forum       from "./pages/Forum.jsx";
import Terminal    from "./pages/Terminal.jsx";
import { Dashboard, Settings } from "./pages/Dashboard.jsx";

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><span className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace/>;
  return children;
}

function AppShell() {
  const [theme, setTheme] = useState(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return "light";
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar onThemeToggle={toggleTheme} theme={theme}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", overflow:"auto" }}>
      <Routes>
        <Route path="/"              element={<Landing/>}/>
        <Route path="/login"         element={<Login/>}/>
        <Route path="/signup"        element={<Signup/>}/>
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="/about"         element={<About/>}/>
        <Route path="/projects"      element={<Projects/>}/>
        <Route path="/analyzer"      element={<Navigate to="/" replace/>}/>
        <Route path="/pricing"       element={<Pricing/>}/>
        <Route path="/forum"         element={<Forum/>}/>
        <Route path="/terminal"      element={<Terminal/>}/>
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/settings"      element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
        <Route path="*"              element={<Navigate to="/" replace/>}/>
      </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell/>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
