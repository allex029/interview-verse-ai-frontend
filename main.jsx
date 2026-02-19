import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import API_URL from "../api";

export default function LiveInterview({ question, sessionId, onComplete }) {
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [webcamError, setWebcamError] = useState(false);

  useEffect(() => {
    if (question) { setTranscript(""); setFeedback(""); setScore(null); setTimeout(() => speakQuestion(), 300); }
  }, [question]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setTranscript(t); };
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  const speakQuestion = () => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(question); u.rate = 0.95; window.speechSynthesis.speak(u); };
  const startAnswer = () => { setTranscript(""); setFeedback(""); setScore(null); setListening(true); recognitionRef.current?.start(); };

  const stopAnswer = async () => {
    recognitionRef.current?.stop(); setListening(false);
    if (!transcript.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ sessionId, question, answerText: transcript, eyeContactScore: Math.floor(Math.random() * 20) + 70 }),
      });
      const data = await res.json();
      setFeedback(data.feedback || "");
      const m = (data.feedback || "").match(/(\d+)\s*\/\s*10/);
      if (m) setScore(Number(m[1]));
    } catch { setFeedback("⚠️ Evaluation failed. Please check your connection."); }
    finally { setEvaluating(false); }
  };

  const scoreColor = score !== null ? (score >= 7 ? "var(--success)" : score >= 4 ? "var(--warning)" : "var(--danger)") : "var(--text-2)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
      <div>
        <div style={{ borderRadius: 16, overflow: "hidden", background: "var(--bg-3)", border: "1px solid var(--border)", position: "relative", aspectRatio: "4/3" }}>
          {!webcamError ? <Webcam ref={webcamRef} audio={false} onUserMediaError={() => setWebcamError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-3)" }}>
              <span style={{ fontSize: "2rem" }}>📷</span><span style={{ fontSize: "0.8rem" }}>Camera unavailable</span>
            </div>
          )}
          {listening && (
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", animation: "blink 1s infinite" }} />
              <span style={{ fontSize: "0.7rem", color: "#fff", fontWeight: 600 }}>RECORDING</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={speakQuestion} style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}>🔊 Replay</button>
          {!listening && !feedback ? <button className="btn btn-primary" onClick={startAnswer} disabled={evaluating} style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}>🎤 Start Answer</button>
            : listening ? <button className="btn btn-danger" onClick={stopAnswer} style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}>⏹ Stop & Evaluate</button> : null}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label className="label" style={{ margin: 0 }}>Your Answer</label>
            {listening && <span style={{ color: "var(--danger)", fontSize: "0.7rem", fontWeight: 600 }}>● LIVE</span>}
          </div>
          <div style={{ background: "var(--bg-2)", border: `1px solid ${listening ? "var(--accent)" : "var(--border)"}`, borderRadius: 12, padding: 16, minHeight: 120, color: transcript ? "var(--text)" : "var(--text-3)", fontSize: "0.875rem", fontFamily: "'DM Mono',monospace", lineHeight: 1.7, transition: "border-color 0.2s" }}>
            {transcript || (listening ? "Listening..." : "Click 'Start Answer' and speak clearly...")}
          </div>
        </div>

        {evaluating && <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12 }}><span className="spinner" /><span style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>AI is evaluating your answer...</span></div>}

        {feedback && !evaluating && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {score !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "14px 16px", background: "var(--bg-2)", border: `1px solid ${scoreColor}30`, borderRadius: 12 }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "'DM Mono',monospace", color: scoreColor }}>{score}<span style={{ fontSize: "1rem", color: "var(--text-3)" }}>/10</span></div>
                <div><div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: 2 }}>Score</div><div style={{ fontSize: "0.8rem", color: scoreColor, fontWeight: 600 }}>{score >= 7 ? "Great answer!" : score >= 4 ? "Decent — room to improve" : "Needs more work"}</div></div>
              </div>
            )}
            <div style={{ padding: 16, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-2)", marginBottom: 12 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 }}>AI Feedback</div>
              {feedback}
            </div>
            <button className="btn btn-ghost" onClick={onComplete} style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>Next Question →</button>
          </div>
        )}
      </div>
    </div>
  );
}
