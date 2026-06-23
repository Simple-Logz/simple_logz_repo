import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
      else navigate("/login", { replace: true });
    });
  }, [navigate]);

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",flexDirection:"column",gap:16}}>
      <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
      <div style={{color:"var(--t2)",fontSize:14}}>Completing sign inâ¦</div>
    </div>
  );
}
