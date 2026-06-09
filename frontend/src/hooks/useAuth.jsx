import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) syncProfile(session.access_token);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) syncProfile(session.access_token);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function syncProfile(token) {
    try {
      const { profile } = await api.syncProfile(token);
      setProfile(profile);
    } catch (err) {
      console.error("Profile sync failed:", err.message);
    }
  }

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithMicrosoft() {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithApple() {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUpWithEmail(email, password, name) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    const token = await getToken();
    if (token) await syncProfile(token);
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      getToken, refreshProfile,
      signInWithGoogle, signInWithGithub,
      signInWithMicrosoft, signInWithApple,
      signInWithEmail, signUpWithEmail,
      signOut,
      isLoggedIn: !!user,
      isPro: profile?.plan === "developer" || profile?.plan === "enterprise",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
