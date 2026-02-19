import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orphanCount, setOrphanCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSession, setExpandedSession] = useState(null);
  const navigate = useNavigate();

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/admin-login"); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true); setError("");
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers: authHeaders() }),
        fetch(`${API}/admin/users`, { headers: authHeaders() }),
      ]);
      if (statsRes.status === 401 || statsRes.status === 403) { navigate("/admin-login"); return; }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      setStats(statsData);
      setUsers(usersData.users || []);
      setOrphanCount(usersData.orphanSessionCount || 0);
    } catch {
      setError("Failed to load dashboard data. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // Migrate orphan sessions to selected user or auto-detect
  const migrateOrphans = async (userId = null) => {
    setMigrating(true); setMigrateMsg("");
    try {
      const body = userId ? { assignToUserId: userId } : {};
      const res = await fetch(`${API}/admin/migrate-orphans`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMigrateMsg(data.message || "Done");
      await loadAll(); // refresh everything
    } catch {
      setMigrateMsg("Migration failed.");
    } finally {
      setMigrating(false);
    }
  };

  const openUserDetail = async (user) => {
    setSelectedUser(user); setUserDetail(null);
    setExpandedSession(null); setActiveTab("users");
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/admin/users/${user._id}`, { headers: authHeaders() });
      const data = await res.json();
      setUserDetail(data.user);
    } catch { setUserDetail(null); }
    finally { setDetailLoading(false); }
  };

  const closeDetail = () => { setSelectedUser(null); setUserDetail(null); setExpandedSession(null); };
  const logout = () => { localStorage.removeItem("token"); navigate("/admin-login"); };
  const scoreColor = (s) => s === null ? "var(--text-3)" : s >= 7 ? "var(--success)" : s >= 4 ? "var(--warning)" : "var(--danger)";

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} onRetry={loadAll} onLogin={() => navigate("/admin-login")} />;

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      {/* Tab bar */}
      <div style={{
        borderBottom: "1px solid var(--border)", background: "var(--bg-1)",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["overview", "users"].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); closeDetail(); }}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeTab === tab ? "rgba(79,156,249,0.12)" : "transparent",
                color: activeTab === tab ? "var(--accent)" : "var(--text-3)",
                fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize",
                fontFamily: "'Syne', sans-serif", transition: "all 0.15s",
              }}>
              {tab === "overview" ? "📊 Overview" : "👥 Users"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={loadAll} style={{ fontSize: "0.78rem", padding: "7px 14px" }}>↻ Refresh</button>
          <button className="btn btn-danger" onClick={logout} style={{ fontSize: "0.78rem", padding: "7px 14px" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── ORPHAN WARNING BANNER ── */}
        {orphanCount > 0 && (
          <div style={{
            marginBottom: 28, padding: "16px 20px", borderRadius: 14,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, color: "var(--warning)", marginBottom: 4 }}>
                ⚠️ {orphanCount} unlinked interview session{orphanCount > 1 ? "s" : ""} found
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                These sessions were created before user tracking was enabled. Click <strong>Fix Now</strong> to assign them to the correct user.
              </div>
              {migrateMsg && (
                <div style={{ marginTop: 8, fontSize: "0.8rem", color: "var(--success)" }}>✓ {migrateMsg}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Per-user assign buttons */}
              {users.filter(u => !u.isAdmin).map(u => (
                <button key={u._id} onClick={() => migrateOrphans(u._id)} disabled={migrating}
                  className="btn btn-ghost"
                  style={{ fontSize: "0.75rem", padding: "7px 12px", borderColor: "rgba(245,158,11,0.3)", color: "var(--warning)" }}>
                  {migrating ? "..." : `Assign to ${u.name.split(" ")[0]}`}
                </button>
              ))}
              <button onClick={() => migrateOrphans()} disabled={migrating}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: migrating ? "not-allowed" : "pointer",
                  background: "rgba(245,158,11,0.2)", color: "var(--warning)",
                  fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Syne',sans-serif",
                  opacity: migrating ? 0.6 : 1,
                }}>
                {migrating ? "Fixing..." : "Auto-Fix →"}
              </button>
            </div>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="animate-in">
            <div style={{ marginBottom: 36 }}>
              <div className="badge badge-yellow" style={{ marginBottom: 12 }}>Admin Panel</div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
              <p style={{ color: "var(--text-2)", marginTop: 6 }}>Platform analytics at a glance</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
              <StatCard icon="👥" label="Total Users" value={stats?.totalUsers ?? "—"} color="#4f9cf9" sub="Registered accounts" />
              <StatCard icon="🎯" label="Interviews" value={stats?.totalInterviews ?? "—"} color="#a78bfa" sub="Sessions conducted" />
              <StatCard icon="⭐" label="Avg Score" value={stats?.averageScore ? `${stats.averageScore}/10` : "—"} color="#34d399" sub="Platform-wide" />
            </div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Recent Users</h3>
                <button className="btn btn-ghost" onClick={() => setActiveTab("users")} style={{ fontSize: "0.75rem", padding: "6px 12px" }}>View all →</button>
              </div>
              {users.length === 0 ? <EmptyState text="No users yet" /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Name","Email","Interviews","Avg Score","Joined"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {users.slice(0,5).map(u => (
                      <tr key={u._id} onClick={() => openUserDetail(u)} style={{ cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <Td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} /><span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{u.name}</span>{u.isAdmin && <span className="badge badge-yellow" style={{ fontSize: "0.6rem" }}>Admin</span>}</div></Td>
                        <Td muted>{u.email}</Td>
                        <Td>{u.totalInterviews}</Td>
                        <Td><ScorePill score={u.overallAvgScore} /></Td>
                        <Td muted>{formatDate(u.createdAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && !selectedUser && (
          <div className="animate-in">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>All Users</h1>
              <p style={{ color: "var(--text-2)", marginTop: 6 }}>{users.length} registered — click any row for full details</p>
            </div>
            {users.length === 0 ? <div className="card"><EmptyState text="No users registered yet." /></div> : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["User","Email","Interviews","Answers","Avg Score","Joined",""].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id}
                        style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={() => openUserDetail(u)}>
                        <Td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.name} /><div><div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{u.name}</div>{u.isAdmin && <span className="badge badge-yellow" style={{ fontSize: "0.6rem", marginTop: 2 }}>Admin</span>}</div></div></Td>
                        <Td muted>{u.email}</Td>
                        <Td>{u.totalInterviews}</Td>
                        <Td>{u.totalAnswers}</Td>
                        <Td><ScorePill score={u.overallAvgScore} /></Td>
                        <Td muted>{formatDate(u.createdAt)}</Td>
                        <Td><span style={{ color: "var(--accent)", fontSize: "0.8rem" }}>View →</span></Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USER DETAIL ── */}
        {activeTab === "users" && selectedUser && (
          <div className="animate-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <button className="btn btn-ghost" onClick={closeDetail} style={{ fontSize: "0.8rem", padding: "8px 14px" }}>← Back</button>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{selectedUser.name}</h1>
                <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>{selectedUser.email}</p>
              </div>
              {selectedUser.isAdmin && <span className="badge badge-yellow">Admin</span>}
            </div>

            {detailLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "40px 0" }}>
                <span className="spinner" /><span style={{ color: "var(--text-2)" }}>Loading user data...</span>
              </div>
            ) : userDetail ? (
              <>
                {/* Stat mini-cards */}
                {(() => {
                  const allR = userDetail.sessions?.flatMap(s => s.results) ?? [];
                  const avg = allR.length ? allR.reduce((s, r) => s + (r.answerScore || 0), 0) / allR.length : null;
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                      <MiniStat label="Total Interviews" value={userDetail.sessions?.length ?? 0} />
                      <MiniStat label="Total Answers" value={allR.length} />
                      <MiniStat label="Overall Avg Score"
                        value={avg !== null ? `${avg.toFixed(1)}/10` : "—"}
                        color={scoreColor(avg)} />
                      <MiniStat label="Member Since" value={formatDate(userDetail.createdAt)} />
                    </div>
                  );
                })()}

                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 16 }}>
                  Interview Sessions ({userDetail.sessions?.length ?? 0})
                </h3>

                {(!userDetail.sessions || userDetail.sessions.length === 0) ? (
                  <div className="card">
                    <EmptyState text="No interviews linked to this user yet." />
                    {orphanCount > 0 && (
                      <div style={{ textAlign: "center", marginTop: 12 }}>
                        <p style={{ color: "var(--text-3)", fontSize: "0.8rem", marginBottom: 12 }}>
                          There are {orphanCount} unlinked sessions. Assign them to this user?
                        </p>
                        <button onClick={() => migrateOrphans(selectedUser._id)} disabled={migrating}
                          style={{
                            padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)",
                            background: "rgba(245,158,11,0.1)", color: "var(--warning)",
                            fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif",
                          }}>
                          {migrating ? "Assigning..." : `Assign ${orphanCount} session${orphanCount > 1 ? "s" : ""} to ${selectedUser.name.split(" ")[0]} →`}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {userDetail.sessions.map((session) => {
                      const isOpen = expandedSession === session._id.toString();
                      const avgScore = session.results.length > 0
                        ? session.results.reduce((s, r) => s + (r.answerScore || 0), 0) / session.results.length
                        : null;

                      return (
                        <div key={session._id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                          <div onClick={() => setExpandedSession(isOpen ? null : session._id.toString())}
                            style={{
                              padding: "16px 20px", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              background: isOpen ? "rgba(79,156,249,0.05)" : "transparent",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                            onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "rgba(79,156,249,0.1)", border: "1px solid rgba(79,156,249,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                              }}>🎯</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{session.role}</div>
                                <div style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: 2 }}>
                                  {formatDate(session.startedAt)} · {session.results.length} answer{session.results.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <ScorePill score={avgScore !== null ? Number(avgScore.toFixed(1)) : null} />
                              <span style={{ color: "var(--text-3)", fontSize: "0.8rem", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                            </div>
                          </div>

                          {isOpen && (
                            <div style={{ borderTop: "1px solid var(--border)", animation: "fadeIn 0.25s ease" }}>
                              {session.results.length === 0 ? (
                                <div style={{ padding: "20px", color: "var(--text-3)", fontSize: "0.85rem" }}>No answers recorded for this session.</div>
                              ) : session.results.map((r, i) => (
                                <div key={i} style={{ padding: "20px", borderBottom: i < session.results.length - 1 ? "1px solid var(--border)" : "none" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Q{i + 1}</div>
                                    <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: "0.95rem", color: scoreColor(r.answerScore) }}>
                                      {r.answerScore ?? "—"}<span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>/10</span>
                                    </div>
                                  </div>
                                  <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 10 }}>{r.question}</p>
                                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border)", fontSize: "0.82rem", fontFamily: "'DM Mono',monospace", color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10 }}>
                                    {r.answerText || <span style={{ color: "var(--text-3)" }}>No answer recorded</span>}
                                  </div>
                                  {r.feedback && (
                                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(79,156,249,0.05)", border: "1px solid rgba(79,156,249,0.12)", fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.6 }}>
                                      <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI Feedback · </span>
                                      {r.feedback}
                                    </div>
                                  )}
                                  <div style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text-3)" }}>Eye contact: {r.eyeContactScore ?? "—"}%</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : <div className="card"><EmptyState text="Could not load user details." /></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small reusable components ──────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card">
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'DM Mono',monospace", color, marginBottom: 4, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{sub}</div>
    </div>
  );
}

function MiniStat({ label, value, color = "var(--text)" }) {
  return (
    <div className="card" style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'DM Mono',monospace", color }}>{value}</div>
    </div>
  );
}

function ScorePill({ score }) {
  const color = score === null ? "var(--text-3)" : score >= 7 ? "var(--success)" : score >= 4 ? "var(--warning)" : "var(--danger)";
  const bg = score === null ? "transparent" : score >= 7 ? "rgba(34,197,94,0.1)" : score >= 4 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  return <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, fontFamily: "'DM Mono',monospace", background: bg, color }}>{score !== null ? `${score}/10` : "—"}</span>;
}

function Avatar({ name }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const hue = (name?.charCodeAt(0) || 0) * 13 % 360;
  return <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `hsl(${hue},40%,20%)`, border: `1px solid hsl(${hue},40%,30%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: `hsl(${hue},70%,70%)` }}>{initials}</div>;
}

function Th({ children }) {
  return <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)" }}>{children}</th>;
}

function Td({ children, muted }) {
  return <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: muted ? "var(--text-3)" : "var(--text)", verticalAlign: "middle" }}>{children}</td>;
}

function EmptyState({ text }) {
  return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-3)" }}><div style={{ fontSize: "2rem", marginBottom: 12 }}>📭</div><div style={{ fontSize: "0.85rem" }}>{text}</div></div>;
}

function LoadingScreen() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64 }}><div style={{ textAlign: "center" }}><div style={{ width: 48, height: 48, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} /><div style={{ color: "var(--text-2)", fontWeight: 600 }}>Loading admin data...</div></div></div>;
}

function ErrorScreen({ msg, onRetry, onLogin }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64 }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div><div style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>{msg}</div><div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}><button className="btn btn-ghost" onClick={onRetry}>Retry</button><button className="btn btn-primary" onClick={onLogin}>Login</button></div></div></div>;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
