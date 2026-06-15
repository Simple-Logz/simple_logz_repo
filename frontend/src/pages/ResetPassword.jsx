import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import styles from "./Auth.module.css";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    if (password !== confirm) { showToast("Passwords don't match", "error"); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      showToast("Password updated ✓", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  }

  const EyeIcon = () => showPw
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <img src="/simplelogz-logo-dark.png" alt="SimpleLogz" style={{height:36,width:"auto"}}/>
        </Link>
        <h1 className={styles.title}>Set new password</h1>
        <p className={styles.sub}>Choose a strong password for your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">New password</label>
            <div style={{position:"relative"}}>
              <input
                className="form-input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required minLength={8}
                style={{paddingRight:40}}
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--t3)",display:"flex",alignItems:"center",padding:0}}>
                <EyeIcon/>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <div style={{position:"relative"}}>
              <input
                className="form-input"
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                style={{paddingRight:40}}
              />
            </div>
            {confirm && password !== confirm && (
              <p style={{fontSize:11,color:"var(--red)",marginTop:4}}>Passwords don't match</p>
            )}
          </div>

          <button className={`btn btn-primary ${styles.submitBtn}`} type="submit" disabled={loading}>
            {loading ? <><span className="spinner"/>Updating…</> : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
