import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const ROLE_SUGGESTIONS = [
  "Frontend Developer", "Backend Engineer", "Full Stack Developer",
  "Data Scientist", "ML Engineer", "DevOps Engineer",
  "Product Manager", "iOS Developer", "Android Developer",
];

export default function Home() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const startInterview = () => {
    if (!role.trim()) return;
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(`/interview?role=${encodeURIComponent(role.trim())}`);
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "64px" }}>
      {/* Hero */}
      <section style={{
        maxWidth: 720, margin: "0 auto", padding: "120px 24px 80px",
        textAlign: "center",
      }}>
        <div className="badge badge-blue animate-in" style={{ marginBottom: 24, animationDelay: "0s" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          AI-Powered Interview Training
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.03em", color: "#e8edf5",
          animation: "slideUp 0.5s ease 0.1s both",
          marginBottom: 24,
        }}>
          Master Any Interview<br />
          <span style={{ color: "var(--accent)" }}>Before It Matters</span>
        </h1>

        <p style={{
          fontSize: "1.1rem", color: "var(--text-2)", lineHeight: 1.7,
          animation: "slideUp 0.5s ease 0.2s both", marginBottom: 48,
          maxWidth: 520, margin: "0 auto 48px",
        }}>
          Practice with real AI-generated questions, get live voice feedback, 
          and receive detailed performance analytics — all in one platform.
        </p>

        {/* Role Input */}
        <div style={{
          background: "var(--bg-1)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 8,
          display: "flex", gap: 8, maxWidth: 560, margin: "0 auto 16px",
          animation: "slideUp 0.5s ease 0.3s both",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <input
            className="input"
            placeholder="Enter your target role..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startInterview()}
            style={{
              background: "transparent", border: "none",
              boxShadow: "none", flex: 1, fontSize: "0.95rem",
            }}
          />
          <button
            className="btn btn-primary"
            onClick={startInterview}
            disabled={!role.trim()}
            style={{ whiteSpace: "nowrap" }}
          >
            Start Interview →
          </button>
        </div>

        {/* Suggestions */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
          animation: "slideUp 0.5s ease 0.4s both",
        }}>
          {ROLE_SUGGESTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                padding: "6px 14px", borderRadius: 20,
                background: "var(--bg-2)", border: "1px solid var(--border)",
                color: "var(--text-3)", fontSize: "0.75rem", fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16,
        }}>
          {[
            { icon: "⚡", title: "AI-Generated Questions", desc: "Role-specific technical questions generated in real-time using LLMs — no static question banks.", color: "#4f9cf9" },
            { icon: "🎤", title: "Voice-Based Answers", desc: "Answer naturally by speaking. Our speech recognition captures every word as you respond.", color: "#a78bfa" },
            { icon: "📊", title: "Instant AI Scoring", desc: "Each answer is evaluated on technical depth, clarity, and completeness with actionable feedback.", color: "#34d399" },
            { icon: "👁", title: "Behavioral Analysis", desc: "Webcam-based eye contact tracking and confidence indicators for a complete assessment.", color: "#f59e0b" },
            { icon: "🗺", title: "Visual Progress Flow", desc: "See your interview journey mapped out as an interactive node graph in real-time.", color: "#f87171" },
            { icon: "📋", title: "Detailed Report", desc: "Post-interview breakdown with strengths, improvement areas, and overall performance score.", color: "#60a5fa" },
          ].map((f, i) => (
            <div key={i} className="card" style={{
              animation: `slideUp 0.5s ease ${0.1 + i * 0.05}s both`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}18`, border: `1px solid ${f.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem", marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.95rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
