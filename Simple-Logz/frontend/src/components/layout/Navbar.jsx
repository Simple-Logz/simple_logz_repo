import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import styles from "./Navbar.module.css";

function IconSun() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function IconMoon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
function IconChevron() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function IconLogout() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconDashboard() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconSettings() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconUpgrade() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>; }
function IconFolder() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>; }

export default function Navbar({ onThemeToggle, theme }) {
  const { isLoggedIn, profile, signOut } = useAuth();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/",         label: "Analyzer" },
    { to: "/terminal", label: "Terminal" },
    { to: "/forum",    label: "Community" },
    { to: "/pricing",  label: "Pricing" },
    { to: "/about",    label: "About" },
  ];

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  async function handleSignOut() {
    setMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate("/");
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={`container ${styles.inner}`}>

          {/* Brand */}
          <Link to="/" className={styles.brand}>
            <img
              src={theme === "dark" ? "/simplelogz-logo-dark.png" : "/simplelogz-logo-light.png"}
              alt="SimpleLogz"
              className={styles.logoImg}
            />
          </Link>

          {/* Desktop nav links */}
          <ul className={styles.links}>
            {navLinks.map(l => (
              <li key={l.to} className={location.pathname === l.to ? styles.active : ""}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className={styles.actions}>
            <button className={`btn btn-ghost ${styles.iconBtn}`} onClick={onThemeToggle} title="Toggle theme">
              {theme === "dark" ? <IconSun/> : <IconMoon/>}
            </button>

            {!isLoggedIn ? (
              <>
                <Link to="/login"  className={`btn btn-outline btn-sm ${styles.desktopOnly}`}>Sign in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
              </>
            ) : (
              <>
                <Link to="/projects" className={`btn btn-outline btn-sm ${styles.desktopOnly}`}>+ New project</Link>
                <div className={styles.userWrap} ref={menuRef}>
                  <button className={styles.avatar} onClick={() => setMenuOpen(o => !o)}>
                    {profile?.avatar
                      ? <img src={profile.avatar} alt={profile.name}/>
                      : <span>{initials}</span>}
                    <IconChevron/>
                  </button>
                  {menuOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropHeader}>
                        <div className={styles.dropName}>{profile?.name || "User"}</div>
                        <div className={styles.dropEmail}>{profile?.email}</div>
                        <span className={`badge ${profile?.plan === "developer" ? "badge-green" : "badge-gray"}`}>
                          {profile?.plan === "developer" ? "Developer" : "Free Plan"}
                        </span>
                      </div>
                      <Link to="/dashboard" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                        <IconDashboard/> Dashboard
                      </Link>
                      <Link to="/projects" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                        <IconFolder/> My projects
                      </Link>
                      <Link to="/settings" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                        <IconSettings/> Settings
                      </Link>
                      <Link to="/pricing" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                        <IconUpgrade/> Upgrade plan
                      </Link>
                      <div className={styles.dropDivider}/>
                      <button className={`${styles.dropItem} ${styles.dropDanger}`} onClick={handleSignOut}>
                        <IconLogout/> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Hamburger â mobile only */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>

            {/* User info if logged in */}
            {isLoggedIn && (
              <div className={styles.mobileUser}>
                <div className={styles.mobileAvatar}>
                  {profile?.avatar
                    ? <img src={profile.avatar} alt={profile.name}/>
                    : <span>{initials}</span>}
                </div>
                <div>
                  <div className={styles.mobileUserName}>{profile?.name || "User"}</div>
                  <div className={styles.mobileUserEmail}>{profile?.email}</div>
                </div>
                <span className={`badge ${profile?.plan === "developer" ? "badge-green" : "badge-gray"}`} style={{marginLeft:"auto"}}>
                  {profile?.plan === "developer" ? "Dev" : "Free"}
                </span>
              </div>
            )}

            {/* Nav links */}
            <div className={styles.mobileLinks}>
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`${styles.mobileLink} ${location.pathname === l.to ? styles.mobileLinkActive : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className={styles.mobileDivider}/>

            {/* Auth actions */}
            {!isLoggedIn ? (
              <div className={styles.mobileActions}>
                <Link to="/login"  className="btn btn-outline" style={{flex:1}} onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link to="/signup" className="btn btn-primary" style={{flex:1}} onClick={() => setMobileOpen(false)}>Get started</Link>
              </div>
            ) : (
              <div className={styles.mobileAuthLinks}>
                <Link to="/projects"  className={styles.mobileLink} onClick={() => setMobileOpen(false)}><IconFolder/> My projects</Link>
                <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}><IconDashboard/> Dashboard</Link>
                <Link to="/settings"  className={styles.mobileLink} onClick={() => setMobileOpen(false)}><IconSettings/> Settings</Link>
                <Link to="/pricing"   className={styles.mobileLink} onClick={() => setMobileOpen(false)}><IconUpgrade/> Upgrade plan</Link>
                <div className={styles.mobileDivider}/>
                <button className={`${styles.mobileLink} ${styles.mobileDanger}`} onClick={handleSignOut}>
                  <IconLogout/> Sign out
                </button>
              </div>
            )}

            <div className={styles.mobileTheme}>
              <span style={{fontSize:14,color:"var(--t2)"}}>Theme</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { onThemeToggle(); }}>
                {theme === "dark" ? <><IconSun/> Light</> : <><IconMoon/> Dark</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
