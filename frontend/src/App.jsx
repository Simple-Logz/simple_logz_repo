import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
import Sidebar        from "./components/layout/Sidebar.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import ChatWidget     from "./components/ChatWidget.jsx";
import FeedbackPopup  from "./components/FeedbackPopup.jsx";
import Landing       from "./pages/Landing.jsx";
import Analyzer      from "./pages/Analyzer.jsx";
import About         from "./pages/About.jsx";
import Docs          from "./pages/Docs.jsx";
import Projects      from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Support       from "./pages/Support.jsx";
import Login         from "./pages/Login.jsx";
import Signup        from "./pages/Signup.jsx";
import AuthCallback  from "./pages/AuthCallback.jsx";
import Pricing       from "./pages/Pricing.jsx";
import Forum         from "./pages/Forum.jsx";
import Terminal      from "./pages/Terminal.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Footer from "./components/Footer.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><span className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace/>;
  return children;
}

function AppShell() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("slz_theme");
    return saved || "dark";
  });
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [paletteOpen, setPaletteOpen]   = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("slz_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <>
      <ScrollToTop/>
      <Sidebar onThemeToggle={toggleTheme} theme={theme} open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)}/>
      <div className="app-content">
        <PageTransition>
          <Routes>
            <Route path="/"              element={<Landing/>}/>
            <Route path="/login/*"        element={<Login/>}/>
            <Route path="/signup/*"      element={<Signup/>}/>
            <Route path="/auth/callback" element={<AuthCallback/>}/>
            <Route path="/about"         element={<About/>}/>
            <Route path="/docs"          element={<Docs/>}/>
            <Route path="/projects"      element={<Projects/>}/>
            <Route path="/projects/:id"  element={<ProtectedRoute><ProjectDetail/></ProtectedRoute>}/>
            <Route path="/support"       element={<Support/>}/>
            <Route path="/analyzer"      element={<Analyzer/>}/>
            <Route path="/pricing"       element={<Pricing/>}/>
            <Route path="/forum"         element={<Forum/>}/>
            <Route path="/terminal"      element={<Terminal/>}/>
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
            <Route path="/settings"      element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
            <Route path="/privacy"         element={<Privacy/>}/>
            <Route path="/terms"           element={<Terms/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/reset-password"  element={<ResetPassword/>}/>
            <Route path="*"                element={<Navigate to="/" replace/>}/>
          </Routes>
        </PageTransition>
      </div>

      {/* Footer drawer — arrow at bottom, slides up on click */}
      <Footer/>

      {/* Search trigger button — top right */}
      <button
        onClick={() => setPaletteOpen(true)}
        title="Search  (Ctrl+K)"
        style={{
          position:"fixed", top:20, right:20, zIndex:200,
          display:"flex", alignItems:"center", gap:9,
          background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:12, padding:"9px 14px",
          cursor:"pointer", color:"var(--t2)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(108,92,231,0.08)",
          transition:"box-shadow 0.2s, transform 0.15s, color 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow="0 6px 28px rgba(108,92,231,0.25), 0 0 0 1px rgba(108,92,231,0.25)"; e.currentTarget.style.color="var(--t1)"; e.currentTarget.style.transform="translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(108,92,231,0.08)"; e.currentTarget.style.color="var(--t2)"; e.currentTarget.style.transform="none"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span style={{ fontSize:13, fontWeight:500 }}>Search</span>
        <kbd style={{
          fontSize:10, background:"var(--bg3)", border:"1px solid var(--border)",
          borderRadius:5, padding:"2px 6px", color:"var(--t3)", fontFamily:"inherit",
        }}>⌘K</kbd>
      </button>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)}/>

      {/* Global overlays */}
      <ChatWidget/>
      <FeedbackPopup/>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppShell/>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
}
