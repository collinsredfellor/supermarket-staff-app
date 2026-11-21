"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEPARTMENTS,
  INITIAL_STAFF,
  INITIAL_TIMELINE,
  StaffMember,
  TimelineEvent,
} from "@/lib/erpData";
import {
  EncryptedChatMessage,
  encryptMessage,
  decryptMessage,
} from "@/lib/cryptoChat";

interface DepartmentWorkspaceProps {
  slug: string;
}

export default function DepartmentWorkspace({ slug }: DepartmentWorkspaceProps) {
  const router = useRouter();
  const department = DEPARTMENTS.find((d) => d.slug === slug.toLowerCase());

  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [handoffNote, setHandoffNote] = useState("");
  const [handoffDoc, setHandoffDoc] = useState("");
  const [sessionRole, setSessionRole] = useState<string>("SENIOR_EXEC_ADMIN");

  // Strategy Co-Admin Appointment inside Department
  const [coAdminName, setCoAdminName] = useState("");
  const [coAdminRole, setCoAdminRole] = useState("");
  const [coAdminNotice, setCoAdminNotice] = useState("");

  // Encrypted Chat States
  const [passphrase, setPassphrase] = useState("SM-ORG-001-SECURE");
  const [chatInput, setChatInput] = useState("");
  const [encryptedMessages, setEncryptedMessages] = useState<EncryptedChatMessage[]>([]);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [showCipherRaw, setShowCipherRaw] = useState(false);

  useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith("staff_admin_auth=1"));
    if (!hasAuth) {
      router.replace("/");
      return;
    }

    let parsedStaff: StaffMember[] = INITIAL_STAFF;
    const savedStaff = localStorage.getItem("sm_erp_staff");
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedStaff = parsed;
          setStaffList(parsedStaff);
        }
      } catch {}
    }

    const rawSession = localStorage.getItem("sm_erp_session");
    let currentSessionStaffId = "";
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession) as {
          role?: string;
          staffId?: string;
        };
        if (session.role) {
          setSessionRole(session.role);
        }
        if (session.staffId) {
          currentSessionStaffId = session.staffId;
        }
      } catch {}
    }

    if (department) {
      const rankedDeptWorkers = parsedStaff
        .filter((s) => s.departmentCode === department.code)
        .sort((a, b) => b.rankScore - a.rankScore);

      let preferredId = rankedDeptWorkers[0]?.id || parsedStaff[0]?.id || "";
      if (
        currentSessionStaffId &&
        rankedDeptWorkers.some((w) => w.id === currentSessionStaffId)
      ) {
        preferredId = currentSessionStaffId;
      }
      if (preferredId) {
        setSelectedStaffId(preferredId);
      }
    }

    const savedTimeline = localStorage.getItem("sm_erp_timeline");
    if (savedTimeline) {
      try {
        setTimeline(JSON.parse(savedTimeline));
      } catch {}
    }

    const savedChat = localStorage.getItem("sm_erp_encrypted_chat");
    if (savedChat) {
      try {
        setEncryptedMessages(JSON.parse(savedChat));
      } catch {}
    }
  }, [department, router]);

  useEffect(() => {
    let active = true;
    async function runDecryption() {
      const nextMap: Record<string, string> = {};
      for (const msg of encryptedMessages) {
        nextMap[msg.id] = await decryptMessage(msg.cipherBase64, msg.ivBase64, passphrase);
      }
      if (active) setDecryptedMap(nextMap);
    }
    runDecryption();
    return () => {
      active = false;
    };
  }, [encryptedMessages, passphrase]);

  if (!department) {
    return (
      <main style={{ minHeight: "100vh", padding: "40px", textAlign: "center" }}>
        <h1>Department Not Found</h1>
        <Link href="/dashboard" style={{ color: "#0f172a", fontWeight: 600 }}>
          ← Return to Senior Executive Portal
        </Link>
      </main>
    );
  }

  const rankedDeptWorkers = staffList
    .filter((s) => s.departmentCode === department.code)
    .sort((a, b) => b.rankScore - a.rankScore);
  const deptExecutiveAdmin = rankedDeptWorkers[0];
  const selectableWorkers = rankedDeptWorkers.length > 0 ? rankedDeptWorkers : staffList;
  const activeWorker =
    selectableWorkers.find((w) => w.id === selectedStaffId) || selectableWorkers[0];

  const canManageStrategy =
    sessionRole === "SENIOR_EXEC_ADMIN" ||
    Boolean(activeWorker?.isStrategyCoAdmin) ||
    activeWorker?.id === deptExecutiveAdmin?.id ||
    activeWorker?.departmentCode === "EXEC-01";

  function persistStaff(next: StaffMember[]) {
    setStaffList(next);
    localStorage.setItem("sm_erp_staff", JSON.stringify(next));
  }

  function handleSignOut() {
    document.cookie = "staff_admin_auth=; path=/; max-age=0";
    localStorage.removeItem("sm_erp_session");
    router.push("/");
  }

  function handleAppointStrategyCoAdmin(e: FormEvent) {
    e.preventDefault();
    if (!coAdminName.trim() || !coAdminRole.trim() || !department || !canManageStrategy) return;

    const appointed: StaffMember = {
      id: `EMP-${Math.floor(2000 + Math.random() * 7900)}`,
      name: coAdminName.trim(),
      title: `${coAdminRole.trim()} (Strategy Co-Admin)`,
      level: "Level 3: Management",
      rankScore: (deptExecutiveAdmin?.rankScore || 80) - 5,
      departmentCode: department.code,
      clearance: "L3-STRATEGY-CO-ADMIN",
      shift: "08:00 - 17:00 EAT",
      email: `${coAdminName.trim().toLowerCase().replace(/\s+/g, ".")}@supermarket-erp.local`,
      badgeCode: `SM-${department.code}-${Math.floor(100 + Math.random() * 899)}`,
      isStrategyCoAdmin: true,
      trackedApps: [
        {
          appName: `${department.code} Strategy & KPI Planner`,
          activeTask: `Co-leading strategy for ${coAdminRole.trim()}`,
          progress: 80,
          status: "Running",
          lastPing: "Just now",
        },
      ],
    };

    const updated = [appointed, ...staffList];
    persistStaff(updated);
    setSelectedStaffId(appointed.id);
    setCoAdminNotice(`Appointed ${appointed.name} as Strategy Co-Admin for ${department.code}.`);
    setCoAdminName("");
    setCoAdminRole("");
  }

  function handleLogWorkflowHandoff(e: FormEvent) {
    e.preventDefault();
    if (!handoffNote.trim() || !department || !activeWorker) return;

    const newEntry: TimelineEvent = {
      id: `TL-${Date.now()}`,
      workflow: "Live Cross-Department Handoff",
      stepNumber: timeline.length + 1,
      departmentCode: department.code,
      actorRole: `${activeWorker.name} (${activeWorker.title})`,
      action: handoffNote.trim(),
      documentRef: handoffDoc.trim() || `${department.code}-DOC-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Completed",
    };

    const updated = [newEntry, ...timeline];
    setTimeline(updated);
    localStorage.setItem("sm_erp_timeline", JSON.stringify(updated));
    setHandoffNote("");
    setHandoffDoc("");
  }

  function handleBumpAppProgress(appIndex: number) {
    if (!activeWorker) return;

    const updatedStaff = staffList.map((s) => {
      if (s.id !== activeWorker.id) return s;
      const nextApps = s.trackedApps.map((app, idx) => {
        if (idx !== appIndex) return app;
        const nextProgress = app.progress >= 100 ? 25 : Math.min(100, app.progress + 15);
        return {
          ...app,
          progress: nextProgress,
          status: nextProgress === 100 ? ("Syncing" as const) : ("Running" as const),
          lastPing: "Just now",
        };
      });
      return { ...s, trackedApps: nextApps };
    });

    persistStaff(updatedStaff);
  }

  async function handleSendEncryptedChat(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !department || !activeWorker) return;

    const { ivBase64, cipherBase64 } = await encryptMessage(chatInput.trim(), passphrase);

    const newMsg: EncryptedChatMessage = {
      id: `MSG-${Date.now()}`,
      departmentCode: department.code,
      senderName: activeWorker.name,
      senderRole: activeWorker.title,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ivBase64,
      cipherBase64,
    };

    const updated = [...encryptedMessages, newMsg];
    setEncryptedMessages(updated);
    localStorage.setItem("sm_erp_encrypted_chat", JSON.stringify(updated));
    setChatInput("");
  }

  const deptChatMessages = encryptedMessages.filter(
    (m) => m.departmentCode === department.code || m.departmentCode === "EXEC-01"
  );

  return (
    <main style={{ minHeight: "100vh", maxWidth: "1320px", margin: "0 auto", padding: "24px 20px 64px" }}>
      {/* Top Department Navigation & Executive Admin Banner */}
      <header
        className="pro-card"
        style={{
          padding: "22px 26px",
          marginBottom: "22px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            {sessionRole === "SENIOR_EXEC_ADMIN" && (
              <Link
                href="/dashboard"
                className="btn-secondary"
                style={{ textDecoration: "none", padding: "6px 12px", fontSize: "12.5px" }}
              >
                ← Senior Executive Portal
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12.5px" }}
            >
              Sign Out
            </button>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "#f1f5f9",
                color: department.accent,
              }}
            >
              {department.code} • {department.badge}
            </span>
            {deptExecutiveAdmin && (
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                }}
              >
                Dept Executive Admin: {deptExecutiveAdmin.name} (Rank {deptExecutiveAdmin.rankScore})
              </span>
            )}
          </div>
          <h1 style={{ fontSize: "25px", fontWeight: 700, color: "#0f172a" }}>{department.name}</h1>
          <p style={{ color: "#475569", fontSize: "13.5px", marginTop: "4px", maxWidth: "820px" }}>
            {department.purpose}
          </p>
        </div>

        <div style={{ minWidth: "250px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
            Select Department Member (Highest Rank = Exec Admin):
          </label>
          <select
            className="pro-select"
            style={{ width: "100%", fontWeight: 600 }}
            value={activeWorker.id}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {selectableWorkers.map((w, idx) => (
              <option key={w.id} value={w.id}>
                {idx === 0 ? "★ [Exec Admin] " : w.isStrategyCoAdmin ? "[Co-Admin] " : ""}
                {w.name} — {w.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* PORT 1 & PORT 2: Credentials Profile + Live Software Tracker */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "22px" }}>
        {/* PORT 1: Credentials & Department Strategy Co-Admins */}
        <div className="pro-card" style={{ flex: "1 1 390px", padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
              Port 01 • Member Credentials & Strategy Authority
            </span>
            <span
              style={{
                padding: "3px 9px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
              }}
            >
              {activeWorker.clearance}
            </span>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>{activeWorker.name}</h2>
          <p style={{ fontSize: "13.5px", color: department.accent, fontWeight: 600, marginBottom: "14px" }}>
            {activeWorker.title} • Rank Score: {activeWorker.rankScore}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "9px",
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Employee ID:</span>
              <strong>{activeWorker.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Badge Code:</span>
              <strong>{activeWorker.badgeCode}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Hierarchy Tier:</span>
              <strong>{activeWorker.level}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Duty Shift:</span>
              <strong>{activeWorker.shift}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Email:</span>
              <strong>{activeWorker.email}</strong>
            </div>
          </div>

          {/* Appoint Strategy Co-Admin Form */}
          <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
              Appoint Department Strategy Co-Admin
            </div>
            {canManageStrategy ? (
              <form onSubmit={handleAppointStrategyCoAdmin} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  className="pro-input"
                  placeholder="Co-Admin Name"
                  value={coAdminName}
                  onChange={(e) => setCoAdminName(e.target.value)}
                  required
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="pro-input"
                    style={{ flex: 1 }}
                    placeholder="Strategy Focus (e.g., Cost & Shift Strategy)"
                    value={coAdminRole}
                    onChange={(e) => setCoAdminRole(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ padding: "9px 12px", fontSize: "12.5px" }}>
                    Appoint
                  </button>
                </div>
                {coAdminNotice && (
                  <p style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>✓ {coAdminNotice}</p>
                )}
              </form>
            ) : (
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Select the Department Executive Admin or a Strategy Co-Admin above to appoint strategy assistants.
              </p>
            )}
          </div>
        </div>

        {/* PORT 2: Real-Time Trackable Software Applications */}
        <div className="pro-card" style={{ flex: "1.4 1 480px", padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Port 02 • Real-Time Trackable Software Applications
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                Active Work Telemetry ({activeWorker.name})
              </h2>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#047857" }}>● LIVE</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {activeWorker.trackedApps.map((app, index) => (
              <div
                key={app.appName}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{app.appName}</strong>
                  <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                    {app.status} • {app.lastPing}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#475569", marginBottom: "10px" }}>
                  {app.activeTask}
                </p>

                <div style={{ width: "100%", height: "8px", borderRadius: "999px", backgroundColor: "#e2e8f0", overflow: "hidden", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: `${app.progress}%`,
                      height: "100%",
                      backgroundColor: department.accent,
                      transition: "width 0.25s ease",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                    Progress: {app.progress}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBumpAppProgress(index)}
                    className="btn-secondary"
                    style={{ padding: "5px 11px", fontSize: "12px" }}
                  >
                    + Log Work Pulse
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>
              DEPARTMENTAL KPIs & DOCUMENTS ({department.code}):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {department.kpis.map((kpi) => (
                <span
                  key={kpi}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 9px",
                    borderRadius: "6px",
                    backgroundColor: "#f1f5f9",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  {kpi}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Interdepartmental Timeline + AES-GCM Encrypted Chat */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div className="pro-card" style={{ flex: "1.2 1 460px", padding: "22px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            Interdepartmental Coordination Timeline
          </h2>
          <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px" }}>
            Log cross-departmental handoffs (e.g., GRN verified, budget approved, roster updated)
          </p>

          <form onSubmit={handleLogWorkflowHandoff} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              className="pro-input"
              placeholder="Action update (e.g., Verified incoming stock batch & issued GRN)"
              value={handoffNote}
              onChange={(e) => setHandoffNote(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="pro-input"
                style={{ flex: 1 }}
                placeholder="Doc Ref (e.g., GRN-2026-445)"
                value={handoffDoc}
                onChange={(e) => setHandoffDoc(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Broadcast Handoff
              </button>
            </div>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "230px", overflowY: "auto" }}>
            {timeline.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <strong style={{ color: "#0f172a" }}>
                    [{t.departmentCode}] {t.actorRole}
                  </strong>
                  <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                    {t.documentRef} • {t.timestamp}
                  </span>
                </div>
                <p style={{ color: "#334155" }}>{t.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pro-card" style={{ flex: "1 1 420px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                AES-256 Encrypted Staff Channel
              </h2>
              <button
                type="button"
                onClick={() => setShowCipherRaw(!showCipherRaw)}
                className="btn-secondary"
                style={{ padding: "5px 10px", fontSize: "11.5px" }}
              >
                {showCipherRaw ? "Show Decrypted" : "Inspect Ciphertext"}
              </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Shared Encryption Key:
              </label>
              <input
                type="password"
                className="pro-input"
                style={{ width: "100%", fontSize: "12.5px" }}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                height: "195px",
                overflowY: "auto",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: "10px",
              }}
            >
              {deptChatMessages.length === 0 ? (
                <p style={{ fontSize: "12.5px", color: "#64748b", textAlign: "center", marginTop: "65px" }}>
                  No encrypted messages in {department.code} yet.
                </p>
              ) : (
                deptChatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      fontSize: "12.5px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>
                      <strong style={{ color: "#0f172a" }}>{msg.senderName}</strong>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p style={{ color: showCipherRaw ? "#b45309" : "#0f172a", wordBreak: "break-word", fontFamily: showCipherRaw ? "monospace" : "inherit" }}>
                      {showCipherRaw ? `AES-GCM::${msg.cipherBase64}` : decryptedMap[msg.id] || "Decrypting..."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSendEncryptedChat} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="pro-input"
              style={{ flex: 1 }}
              placeholder={`Encrypted message as ${activeWorker.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
