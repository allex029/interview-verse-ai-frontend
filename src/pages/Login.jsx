import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Cannot reach server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your interview prep">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Email">
          <input className="input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()} />
        </FormField>
        <FormField label="Password">
          <input className="input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()} />
        </FormField>
        {error && <ErrorMsg msg={error} />}
        <button className="btn btn-primary" onClick={login} disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "14px" }}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : "Sign In →"}
        </button>
        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "0.85rem", marginTop: 8 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 20px", background: "linear-gradient(135deg, #4f9cf9, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#fff", boxShadow: "0 0 24px rgba(79,156,249,0.4)" }}>AI</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{subtitle}</p>
        </div>
        <div className="card" style={{ padding: 32, boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>{children}</div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function ErrorMsg({ msg }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: "0.8rem" }}>{msg}</div>
  );
}
