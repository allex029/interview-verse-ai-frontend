import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function InterviewReport() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interview/report/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <LoadingScreen text="Generating your performance report..." />
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 16 }}>⚠️</div>
        <div style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>Report unavailable</div>
        <div style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: 24 }}>{error}</div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>← Go Home</button>
      </div>
    </div>
  );

  if (!report) return null;

  const scoreColor = report.avgAnswerScore >= 7 ? "var(--success)"
    : report.avgAnswerScore >= 4 ? "var(--warning)" : "var(--danger)";

  const scoreLabel = report.avgAnswerScore >= 7 ? "Excellent"
    : report.avgAnswerScore >= 4 ? "Good" : "Needs Work";

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: "slideUp 0.4s ease" }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>Interview Complete</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Performance Report
          </h1>
          <p style={{ color: "var(--text-2)" }}>
            Here's a detailed breakdown of your interview session.
          </p>
        </div>

        {/* Score Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32,
          animation: "slideUp 0.4s ease 0.1s both",
        }}>
          <ScoreCard
            label="Answer Score"
            value={`${report.avgAnswerScore}/10`}
            sub={scoreLabel}
            color={scoreColor}
            icon="💡"
          />
          <ScoreCard
            label="Eye Contact"
            value={`${report.avgEyeScore}%`}
            sub="Attention score"
            color="var(--accent)"
            icon="👁"
          />
          <ScoreCard
            label="Questions"
            value={report.totalQuestions}
            sub="Total attempted"
            color="var(--text-2)"
            icon="📋"
          />
        </div>

        {/* Score visualization */}
        <div className="card" style={{ marginBottom: 24, animation: "slideUp 0.4s ease 0.15s both" }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: "0.9rem" }}>Overall Performance</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              fontSize: "4rem", fontWeight: 800, fontFamily: "'DM Mono', monospace",
              color: scoreColor, lineHeight: 1,
            }}>
              {Math.round(report.avgAnswerScore * 10)}
              <span style={{ fontSize: "1.5rem", color: "var(--text-3)" }}>%</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
                  width: `${report.avgAnswerScore * 10}%`,
                  transition: "width 1s ease",
                }} />
              </div>
              <div style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--text-2)" }}>
                {scoreLabel} performance across {report.totalQuestions} questions
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "slideUp 0.4s ease 0.2s both" }}>
          {/* Strengths */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--success)" }}>✓</span> Strengths
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(report.strengths || []).map((s, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                  fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-2)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }}>✓</span>
                  {s}
                </div>
              ))}
              {(!report.strengths || report.strengths.length === 0) && (
                <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>No strengths recorded.</p>
              )}
            </div>
          </div>

          {/* Improvements */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--warning)" }}>↑</span> Areas to Improve
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(report.improvements || []).map((s, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
                  fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-2)",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }}>→</span>
                  {s}
                </div>
              ))}
              {(!report.improvements || report.improvements.length === 0) && (
                <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>No improvements recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 32, textAlign: "center", padding: "32px",
          background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 20,
          animation: "slideUp 0.4s ease 0.3s both",
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ready for another round?</h3>
          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", marginBottom: 24 }}>
            Keep practicing to sharpen your skills and boost your confidence.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Practice Again
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/")}>
              ← Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, sub, color, icon }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{
        fontSize: "1.5rem", marginBottom: 12,
        width: 48, height: 48, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>{icon}</div>
      <div style={{
        fontSize: "2rem", fontWeight: 800, fontFamily: "'DM Mono', monospace",
        color, marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{sub}</div>
    </div>
  );
}

function LoadingScreen({ text }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20, paddingTop: 64,
    }}>
      <div style={{
        width: 60, height: 60, border: "2px solid var(--border)",
        borderTopColor: "var(--accent)", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{text}</div>
        <div style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>This may take a moment...</div>
      </div>
    </div>
  );
}
