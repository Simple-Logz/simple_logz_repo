import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  function startClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  function handleEnter() {
    cancelClose();
    setOpen(true);
  }

  return (
    <>
      {/* Arrow toggle — hover to open */}
      <button
        className={styles.toggle}
        onMouseEnter={handleEnter}
        onMouseLeave={startClose}
        aria-label="Show footer"
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: "transform 0.4s cubic-bezier(.22,1,.36,1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      {/* Footer drawer — stays open while cursor is inside */}
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        onMouseEnter={cancelClose}
        onMouseLeave={startClose}
      >
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>SL</div>
              <div className={styles.brandName}>SimpleLogz</div>
              <p className={styles.desc}>AI-powered log intelligence for developers and IT teams.</p>
            </div>
            <div>
              <div className={styles.head}>Product</div>
              <div className={styles.links}>
                <Link to="/" onClick={() => setOpen(false)}>Analyzer</Link>
                <Link to="/forum" onClick={() => setOpen(false)}>Community</Link>
                <Link to="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
              </div>
            </div>
            <div>
              <div className={styles.head}>Account</div>
              <div className={styles.links}>
                <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
                <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              </div>
            </div>
            <div>
              <div className={styles.head}>Legal</div>
              <div className={styles.links}>
                <Link to="/privacy" onClick={() => setOpen(false)}>Privacy Policy</Link>
                <Link to="/terms" onClick={() => setOpen(false)}>Terms of Service</Link>
                <a href="#">Security</a>
              </div>
            </div>
          </div>
          <div className={styles.bottom}>
            <span className={styles.tagline}>Built for engineers worldwide.</span>
            <span className={styles.copy}>© 2026 SimpleLogz. All rights reserved.</span>
          </div>
        </div>
      </div>
    </>
  );
}
