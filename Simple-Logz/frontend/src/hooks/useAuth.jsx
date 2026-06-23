import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken }                   = useClerkAuth();
  const { signOut: clerkSignOut }      = useClerk();
  const [profile, setProfile]          = useState(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncProfile();
    } else if (isLoaded && !isSignedIn) {
      setProfile(null);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  async function syncProfile() {
    try {
      const token = await getToken();
      const { profile } = await api.syncProfile(token);
      setProfile(profile);
    } catch (err) {
      console.error("Profile sync failed:", err.message);
    }
  }

  async function signOut() {
    await clerkSignOut();
    setProfile(null);
  }

  async function refreshProfile() {
    await syncProfile();
  }

  // Normalize Clerk user to match the shape the rest of the app expects
  const normalizedUser = user ? {
    id:            user.id,
    email:         user.emailAddresses[0]?.emailAddress,
    user_metadata: {
      full_name:  user.fullName || user.firstName,
      avatar_url: user.imageUrl,
    },
  } : null;

  return (
    <AuthContext.Provider value={{
      user:          normalizedUser,
      profile,
      loading:       !isLoaded,
      getToken,
      refreshProfile,
      signOut,
      isLoggedIn:    !!isSignedIn,
      isPro:         profile?.plan === "developer" || profile?.plan === "enterprise",
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
