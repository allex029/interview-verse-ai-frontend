import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    const decoded = parseJwt(t);
    setIsAdmin(decoded?.isAdmin === true);
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 24px",
      background: scrolled ? "rgba(8,11,16,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.3s ease",
      height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #4f9cf9, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: 800, color: "#fff",
          boxShadow: "0 0 16px rgba(79,156,249,0.4)",
        }}>AI</div>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "#e8edf5", letterSpacing: "-0.01em" }}>
          InterviewAI
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <NavLink to="/" active={isActive("/")}>Home</NavLink>
        {token && <NavLink to="/interview" active={isActive("/interview")}>Practice</NavLink>}
        {isAdmin && <NavLink to="/admin" active={isActive("/admin")}>Admin</NavLink>}

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.07)", margin: "0 8px" }} />

        {!token ? (
          <>
            <Link to="/login">
              <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                Get Started
              </button>
            </Link>
            <Link to="/admin-login">
              <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.8rem", color: "var(--warning)", borderColor: "rgba(245,158,11,0.3)" }}>
                🔒 Admin
              </button>
            </Link>
          </>
        ) : (
          <button onClick={logout} className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link to={to} style={{
      padding: "8px 14px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500,
      color: active ? "#e8edf5" : "#8b96a8",
      background: active ? "rgba(255,255,255,0.06)" : "transparent",
      transition: "all 0.15s", textDecoration: "none",
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#e8edf5"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#8b96a8"; e.currentTarget.style.background = "transparent"; }}}
    >{children}</Link>
  );
}
