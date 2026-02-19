import { useState, useEffect, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import LiveInterview from "../components/LiveInterview";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function InterviewFlow() {
  const [sessionId, setSessionId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleFromUrl = searchParams.get("role");

  useEffect(() => {
    if (roleFromUrl) {
      startInterview(roleFromUrl);
    }
  }, []);

  const buildGraph = useCallback((qs, role, completed = new Set()) => {
    const nodeStyle = {
      background: "#111823", border: "1px solid rgba(255,255,255,0.1)",
      color: "#e8edf5", borderRadius: "12px", fontSize: "12px",
      fontFamily: "'Syne', sans-serif", fontWeight: 600,
      padding: "10px 16px",
    };

    const newNodes = [
      {
        id: "role",
        data: { label: `🎯 ${role}` },
        position: { x: 300, y: 0 },
        style: { ...nodeStyle, background: "rgba(79,156,249,0.15)", border: "1px solid rgba(79,156,249,0.4)", color: "#4f9cf9" },
      },
    ];

    qs.forEach((q, i) => {
      const isCompleted = completed.has(i);
      newNodes.push({
        id: `q${i}`,
        data: { label: `Q${i + 1}` },
        position: { x: 300, y: (i + 1) * 110 },
        style: {
          ...nodeStyle,
          background: isCompleted ? "rgba(34,197,94,0.12)" : "var(--bg-2)",
          border: isCompleted ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
          color: isCompleted ? "#22c55e" : "#8b96a8",
          width: 80, textAlign: "center",
        },
      });
    });

    const newEdges = qs.map((_, i) => ({
      id: `e${i}`,
      source: i === 0 ? "role" : `q${i - 1}`,
      target: `q${i}`,
      style: { stroke: "rgba(255,255,255,0.1)", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.2)" },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  const startInterview = async (role) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!data.questions) throw new Error(data.error || "No questions generated");
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      buildGraph(data.questions, role);
      setActiveQuestionIndex(0);
    } catch (err) {
      setError(err.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuestion = () => {
    const nextIdx = activeQuestionIndex + 1;
    const newCompleted = new Set([...completedIndices, activeQuestionIndex]);
    setCompletedIndices(newCompleted);
    buildGraph(questions, roleFromUrl, newCompleted);

    if (nextIdx >= questions.length) {
      navigate(`/report/${sessionId}`);
    } else {
      setActiveQuestionIndex(nextIdx);
    }
  };

  const progress = questions.length > 0
    ? Math.round((completedIndices.size / questions.length) * 100)
    : 0;

  if (loading) {
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
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Generating your interview...</div>
          <div style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>AI is crafting role-specific questions</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20, paddingTop: 64,
      }}>
        <div style={{ fontSize: "2rem" }}>⚠️</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--danger)" }}>Interview failed to start</div>
          <div style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: 20 }}>{error}</div>
          <button className="btn btn-primary" onClick={() => navigate("/")}>← Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{
        padding: "16px 32px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-1)",
      }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Interview Session
          </div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
            {roleFromUrl}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {questions.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginBottom: 6 }}>
                {completedIndices.size} / {questions.length} completed
              </div>
              <div style={{ width: 180, height: 4, background: "var(--bg-3)", borderRadius: 2 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: "var(--accent)", width: `${progress}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          )}
          {activeQuestionIndex !== null && (
            <div className="badge badge-blue">
              Q{activeQuestionIndex + 1} of {questions.length}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar: flow graph */}
        <div style={{
          width: 220, borderRight: "1px solid var(--border)",
          background: "var(--bg-1)", flexShrink: 0,
        }}>
          <div style={{ height: "100%", minHeight: "calc(100vh - 130px)" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              panOnDrag={false}
              style={{ background: "var(--bg-1)" }}
            >
              <Background color="rgba(255,255,255,0.03)" gap={20} />
            </ReactFlow>
          </div>
        </div>

        {/* Right: Interview area */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          {activeQuestionIndex !== null && activeQuestionIndex < questions.length && (
            <div className="animate-in">
              {/* Question */}
              <div style={{
                padding: "20px 24px", borderRadius: 16,
                background: "var(--bg-1)", border: "1px solid var(--border)",
                marginBottom: 24,
              }}>
                <div style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "var(--accent)", textTransform: "uppercase", marginBottom: 12,
                }}>
                  Question {activeQuestionIndex + 1}
                </div>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.6, fontWeight: 600 }}>
                  {questions[activeQuestionIndex]}
                </p>
              </div>

              <LiveInterview
                question={questions[activeQuestionIndex]}
                sessionId={sessionId}
                onComplete={goToNextQuestion}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
