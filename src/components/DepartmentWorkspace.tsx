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
        parsedStaff = JSON.parse(savedStaff);
        setStaffList(parsedStaff);
      } catch {}
    }

    if (department) {
      const deptWorkers = parsedStaff.filter((s) => s.departmentCode === department.code);
      if (deptWorkers.length > 0) {
        setSelectedStaffId(deptWorkers[0].id);
      } else if (parsedStaff.length > 0) {
        setSelectedStaffId(parsedStaff[0].id);
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

  // Decrypt messages whenever passphrase or encryptedMessages change
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
        <Link href="/dashboard" style={{ color: "#38bdf8" }}>
          ← Return to Admin Command Portal
        </Link>
      </main>
    );
  }

  const deptWorkers = staffList.filter((s) => s.departmentCode === department.code);
  const selectableWorkers = deptWorkers.length > 0 ? deptWorkers : staffList;
  const activeWorker =
    selectableWorkers.find((w) => w.id === selectedStaffId) || selectableWorkers[0];

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

    setStaffList(updatedStaff);
    localStorage.setItem("sm_erp_staff", JSON.stringify(updatedStaff));
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
    <main style={{ minHeight: "100vh", maxWidth: "1280px", margin: "0 auto", padding: "24px 18px 60px" }}>
      {/* Top Department Navigation & Banner */}
      <header
        className="glass-card"
        style={{
          padding: "22px 26px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Link
              href="/dashboard"
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "#f8fafc",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              ← All Departments
            </Link>
            <span style={{ fontSize: "12px", fontWeight: 700, color: department.accent }}>
              MODULE {department.code} • {department.badge.toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700 }}>{department.name}</h1>
          <p style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px", maxWidth: "780px" }}>
            {department.purpose}
          </p>
        </div>

        {/* Switch Active Staff Member in This Department */}
        <div style={{ minWidth: "240px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
            Active Staff Workstation Profile:
          </label>
          <select
            value={activeWorker.id}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "13.5px",
              fontWeight: 600,
            }}
          >
            {selectableWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* PORT 1 & PORT 2: Staff Credentials Profile + Real-Time Trackable Software Applications */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
        {/* PORT 1: Staff Profile & Credentials Section */}
        <div className="glass-card" style={{ flex: "1 1 380px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase" }}>
              Port 01 • Staff Credentials & Identity
            </span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                background: "rgba(56, 189, 248, 0.18)",
                color: "#38bdf8",
              }}
            >
              {activeWorker.clearance}
            </span>
          </div>

          <h2 style={{ fontSize: "21px", fontWeight: 700 }}>{activeWorker.name}</h2>
          <p style={{ fontSize: "14px", color: department.accent, fontWeight: 600, marginBottom: "16px" }}>
            {activeWorker.title}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Employee ID:</span>
              <strong>{activeWorker.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Access Badge Code:</span>
              <strong>{activeWorker.badgeCode}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Hierarchy Tier:</span>
              <strong>{activeWorker.level}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Active Duty Shift:</span>
              <strong>{activeWorker.shift}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Official Email:</span>
              <strong>{activeWorker.email}</strong>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>
              Authorized Departmental Paperwork & Registers:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {department.documents.map((doc) => (
                <span
                  key={doc}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 9px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.08)",
                    color: "#e2e8f0",
                  }}
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PORT 2: Real-Time Trackable Software Applications Port */}
        <div className="glass-card" style={{ flex: "1.4 1 480px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase" }}>
                Port 02 • Live Trackable Software Applications
              </span>
              <h2 style={{ fontSize: "19px", fontWeight: 700, marginTop: "2px" }}>
                Active Workstation Telemetry ({activeWorker.name})
              </h2>
            </div>
            <span style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>● TELEMETRY ACTIVE</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
            {activeWorker.trackedApps.map((app, index) => (
              <div
                key={app.appName}
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "14.5px", color: "#f8fafc" }}>{app.appName}</strong>
                  <span style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>
                    {app.status} • {app.lastPing}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "10px" }}>
                  Current Work: {app.activeTask}
                </p>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: `${app.progress}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${department.accent}, #10b981)`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>Task Completion: {app.progress}%</span>
                  <button
                    type="button"
                    onClick={() => handleBumpAppProgress(index)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${department.accent}66`,
                      background: "rgba(255,255,255,0.08)",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Log Live Work Pulse
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Departmental KPIs Strip */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "8px" }}>
              MEASURED DEPARTMENTAL KPIs ({department.code}):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {department.kpis.map((kpi) => (
                <span
                  key={kpi}
                  style={{
                    fontSize: "12px",
                    padding: "5px 10px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.14)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#6ee7b7",
                  }}
                >
                  {kpi}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Interdepartmental Timeline Handoff + AES-GCM Encrypted Staff Chat */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Live Interdepartmental Handoff & Product Receiving Timeline */}
        <div className="glass-card" style={{ flex: "1.2 1 460px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
            Interdepartmental Coordination Timeline
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
            Broadcast a live handoff (e.g., Goods Received Note verified → trigger Finance & Shelf Replenishment).
          </p>

          <form onSubmit={handleLogWorkflowHandoff} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Action update (e.g., Verified 120 cartons at Receiving Bay 2, issued GRN)"
              value={handoffNote}
              onChange={(e) => setHandoffNote(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#f8fafc",
                fontSize: "13.5px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Doc Ref (e.g., GRN-2026-442)"
                value={handoffDoc}
                onChange={(e) => setHandoffDoc(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981, #0ea5e9)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Broadcast Handoff →
              </button>
            </div>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
            {timeline.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "#38bdf8" }}>
                    [{t.departmentCode}] {t.actorRole}
                  </strong>
                  <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>
                    {t.documentRef} • {t.timestamp}
                  </span>
                </div>
                <p style={{ color: "#e2e8f0" }}>{t.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* End-to-End AES-GCM Encrypted Staff Chat */}
        <div className="glass-card" style={{ flex: "1 1 420px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                🔒 AES-256 Encrypted Staff Channel
              </h2>
              <button
                type="button"
                onClick={() => setShowCipherRaw(!showCipherRaw)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#cbd5e1",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                {showCipherRaw ? "Show Decrypted" : "Inspect Ciphertext"}
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Shared Branch Encryption Key (Change to test zero-knowledge lock):
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  background: "rgba(15, 23, 42, 0.65)",
                  color: "#6ee7b7",
                  fontSize: "12.5px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                height: "200px",
                overflowY: "auto",
                padding: "10px",
                borderRadius: "12px",
                background: "rgba(9, 13, 22, 0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "12px",
              }}
            >
              {deptChatMessages.length === 0 ? (
                <p style={{ fontSize: "12.5px", color: "#64748b", textAlign: "center", marginTop: "65px" }}>
                  No encrypted messages in {department.code} yet. Send a secure dispatch below.
                </p>
              ) : (
                deptChatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      fontSize: "12.5px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "11px", marginBottom: "3px" }}>
                      <strong style={{ color: "#38bdf8" }}>{msg.senderName}</strong>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p style={{ color: showCipherRaw ? "#fbbf24" : "#f8fafc", wordBreak: "break-word", fontFamily: showCipherRaw ? "monospace" : "inherit" }}>
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
              placeholder={`Encrypted message as ${activeWorker.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(15, 23, 42, 0.65)",
                color: "#f8fafc",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Encrypt & Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
