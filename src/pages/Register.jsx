import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout, FormField, ErrorMsg } from "./Login";
import API_URL from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { navigate("/login"); }
      else { setError(data.error || "Registration failed."); }
    } catch {
      setError("Cannot reach server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start your AI-powered interview prep">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Full Name">
          <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </FormField>
        <FormField label="Email">
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </FormField>
        <FormField label="Password">
          <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === "Enter" && register()} />
        </FormField>
        {error && <ErrorMsg msg={error} />}
        <button className="btn btn-primary" onClick={register} disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "14px" }}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : "Create Account →"}
        </button>
        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "0.85rem", marginTop: 8 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
