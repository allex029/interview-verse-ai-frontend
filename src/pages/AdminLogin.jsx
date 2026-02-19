import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, FormField, ErrorMsg } from "./Login";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/admin");
      } else {
        setError("Unauthorized. Admin credentials required.");
      }
    } catch {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Portal" subtitle="Restricted access — authorized personnel only">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 4,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          color: "var(--warning)", fontSize: "0.8rem", display: "flex", gap: 8, alignItems: "center",
        }}>
          🔒 Admin authentication required
        </div>
        <FormField label="Admin Email">
          <input className="input" type="email" placeholder="admin@company.com"
            value={email} onChange={e => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password">
          <input className="input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
        </FormField>

        {error && <ErrorMsg msg={error} />}

        <button className="btn btn-primary" onClick={login} disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "14px" }}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Authenticating...</> : "Access Dashboard →"}
        </button>
      </div>
    </AuthLayout>
  );
}
