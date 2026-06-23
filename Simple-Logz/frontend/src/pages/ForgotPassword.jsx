import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import styles from "./Auth.module.css";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <img src="/simplelogz-logo-dark.png" alt="SimpleLogz" style={{height:36,width:"auto"}}/>
        </Link>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.sub}>Enter your email and we'll send you a reset link</p>

        {sent ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>ð¬</div>
            <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.6}}>
              Check your inbox at <strong>{email}</strong>.<br/>
              Click the link in the email to reset your password.
            </p>
            <Link to="/login" style={{display:"inline-block",marginTop:16,fontSize:13,color:"var(--accent)"}}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button className={`btn btn-primary ${styles.submitBtn}`} type="submit" disabled={loading}>
              {loading ? <><span className="spinner"/>Sendingâ¦</> : "Send reset link"}
            </button>
          </form>
        )}

        {!sent && (
          <div className={styles.foot}>
            <Link to="/login">Back to sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
