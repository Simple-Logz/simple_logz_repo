import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: 16, background: "var(--bg)",
    }}>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            rootBox:      { width: "100%", maxWidth: 420 },
            card:         { borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" },
            headerTitle:  { fontSize: 22, fontWeight: 700 },
          },
        }}
      />
    </div>
  );
}
