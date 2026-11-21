"use client";

import { useEffect, useState, FormEvent, ChangeEvent, KeyboardEvent } from "react";
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

type DeptTab = "home" | "messages" | "profile";

export default function DepartmentWorkspace({ slug }: DepartmentWorkspaceProps) {
  const router = useRouter();
  const department = DEPARTMENTS.find((d) => d.slug === slug.toLowerCase());

  const [activeTab, setActiveTab] = useState<DeptTab>("home");
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [handoffNote, setHandoffNote] = useState("");
  const [handoffDoc, setHandoffDoc] = useState("");
  const [sessionRole, setSessionRole] = useState<string>("SENIOR_EXEC_ADMIN");

  const [coAdminName, setCoAdminName] = useState("");
  const [coAdminRole, setCoAdminRole] = useState("");
  const [coAdminNotice, setCoAdminNotice] = useState("");

  // Chat Mode States
  const [passphrase, setPassphrase] = useState("SM-ORG-001-SECURE");
  const [chatInput, setChatInput] = useState("");
  const [enterToSend, setEnterToSend] = useState(true);
  const [encryptedMessages, setEncryptedMessages] = useState<EncryptedChatMessage[]>([]);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [showCipherRaw, setShowCipherRaw] = useState(false);

  // Editable Profile State
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBio, setEditBio] = useState("");
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  function syncProfileForm(worker: StaffMember) {
    setEditName(worker.name || "");
    setEditUsername(worker.username || "");
    setEditPhone(worker.phone || "");
    setEditPassword(worker.password || "");
    setEditAvatarUrl(worker.avatarUrl || "");
    setEditBio(worker.bio || "");
    setProfileSavedMsg("");
  }

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
      } catch {
        // ignore
      }
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
      } catch {
        // ignore
      }
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
        const found = parsedStaff.find((s) => s.id === preferredId);
        if (found) syncProfileForm(found);
      }
    }

    const savedTimeline = localStorage.getItem("sm_erp_timeline");
    if (savedTimeline) {
      try {
        setTimeline(JSON.parse(savedTimeline));
      } catch {
        // ignore
      }
    }

    const savedChat = localStorage.getItem("sm_erp_encrypted_chat");
    if (savedChat) {
      try {
        setEncryptedMessages(JSON.parse(savedChat));
      } catch {
        // ignore
      }
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
          <- Return to Senior Executive Portal
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

  function handleSelectWorker(newId: string) {
    setSelectedStaffId(newId);
    const chosen = selectableWorkers.find((w) => w.id === newId);
    if (chosen) syncProfileForm(chosen);
  }

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

    const slugUser = coAdminName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".");
    const appointed: StaffMember = {
      id: `EMP-${Math.floor(2000 + Math.random() * 7900)}`,
      name: coAdminName.trim(),
      username: slugUser,
      phone: "+254 700 000 000",
      password: "staff123",
      avatarUrl: "",
      bio: `${coAdminRole.trim()} assisting ${department.name} strategy.`,
      title: `${coAdminRole.trim()} (Strategy Co-Admin)`,
      level: "Level 3: Management",
      rankScore: (deptExecutiveAdmin?.rankScore || 80) - 5,
      departmentCode: department.code,
      clearance: "L3-STRATEGY-CO-ADMIN",
      shift: "08:00 - 17:00 EAT",
      email: `${slugUser}@supermarket-erp.local`,
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
    syncProfileForm(appointed);
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

  async function submitDeptChat() {
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

  async function handleSendEncryptedChat(e: FormEvent) {
    e.preventDefault();
    await submitDeptChat();
  }

  function handleDeptChatKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (enterToSend && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submitDeptChat();
    }
  }

  function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!activeWorker) return;

    const updated = staffList.map((member) =>
      member.id === activeWorker.id
        ? {
            ...member,
            name: editName.trim() || member.name,
            username: editUsername.trim() || member.username,
            phone: editPhone.trim() || member.phone,
            password: editPassword || member.password,
            avatarUrl: editAvatarUrl,
            bio: editBio.trim(),
          }
        : member
    );
    persistStaff(updated);
    setProfileSavedMsg("Profile details updated.");
  }

  const deptChatMessages = encryptedMessages.filter(
    (m) => m.departmentCode === department.code || m.departmentCode === "EXEC-01"
  );

  return (
    <>
      <nav className="insta-dock" aria-label="Department Navigation">
        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Messages</span>
        </button>

        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => {
            syncProfileForm(activeWorker);
            setActiveTab("profile");
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>

      <main
        className="dock-main-content"
        style={{
          minHeight: "100vh",
          maxWidth: "1280px",
          marginRight: "auto",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "24px",
        }}
      >
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            {activeWorker.avatarUrl ? (
              <img
                src={activeWorker.avatarUrl}
                alt={activeWorker.name}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "999px",
                  objectFit: "cover",
                  border: "2px solid #0f172a",
                }}
              />
            ) : (
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "19px",
                  flexShrink: 0,
                }}
              >
                {activeWorker.name.charAt(0)}
              </div>
            )}

            <div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                {sessionRole === "SENIOR_EXEC_ADMIN" && (
                  <Link href="/dashboard" className="btn-secondary" style={{ textDecoration: "none", padding: "5px 11px", fontSize: "12px" }}>
                    <- Senior Executive Portal
                  </Link>
                )}
                <button type="button" onClick={handleSignOut} className="btn-secondary" style={{ padding: "5px 11px", fontSize: "12px" }}>
                  Sign Out
                </button>
                <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: department.accent }}>
                  {department.code} | {department.badge}
                </span>
                {deptExecutiveAdmin && (
                  <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px", backgroundColor: "#0f172a", color: "#ffffff" }}>
                    Dept Executive Admin: {deptExecutiveAdmin.name}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>
                {activeWorker.name} - {department.name}
              </h1>
              <p style={{ color: "#475569", fontSize: "13px", marginTop: "3px" }}>
                <strong>His Doings:</strong> {activeWorker.trackedApps[0]?.activeTask || department.purpose}
              </p>
            </div>
          </div>

          <div style={{ minWidth: "240px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>
              Active Member in {department.code}:
            </label>
            <select
              className="pro-select"
              style={{ width: "100%", fontWeight: 600 }}
              value={activeWorker.id}
              onChange={(e) => handleSelectWorker(e.target.value)}
            >
              {selectableWorkers.map((w, idx) => (
                <option key={w.id} value={w.id}>
                  {idx === 0 ? "* [Exec Admin] " : w.isStrategyCoAdmin ? "[Co-Admin] " : ""}
                  {w.name} - {w.title}
                </option>
              ))}
            </select>
          </div>
        </header>

        {activeTab === "home" && (
          <>
            <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "22px" }}>
              <div className="pro-card" style={{ flex: "1 1 380px", padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    Member Summary & Authority
                  </span>
                  <span style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, backgroundColor: "#f1f5f9", color: "#0f172a" }}>
                    {activeWorker.clearance}
                  </span>
                </div>

                <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>{activeWorker.name}</h2>
                <p style={{ fontSize: "13px", color: department.accent, fontWeight: 600, marginBottom: "8px" }}>
                  {activeWorker.title} | Rank {activeWorker.rankScore}
                </p>
                {activeWorker.bio && (
                  <p style={{ fontSize: "12.5px", color: "#475569", marginBottom: "12px" }}>{activeWorker.bio}</p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Username:</span>
                    <strong>@{activeWorker.username}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Phone:</span>
                    <strong>{activeWorker.phone}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Badge Code:</span>
                    <strong>{activeWorker.badgeCode}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Duty Shift:</span>
                    <strong>{activeWorker.shift}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                    Appoint Department Strategy Co-Admin
                  </div>
                  {canManageStrategy ? (
                    <form onSubmit={handleAppointStrategyCoAdmin} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input type="text" className="pro-input" placeholder="Co-Admin Name" value={coAdminName} onChange={(e) => setCoAdminName(e.target.value)} required />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" className="pro-input" style={{ flex: 1 }} placeholder="Strategy Focus" value={coAdminRole} onChange={(e) => setCoAdminRole(e.target.value)} required />
                        <button type="submit" className="btn-primary" style={{ padding: "9px 12px", fontSize: "12.5px" }}>Appoint</button>
                      </div>
                      {coAdminNotice && <p style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>[OK] {coAdminNotice}</p>}
                    </form>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>
                      Select the Department Executive Admin or a Strategy Co-Admin above to appoint strategy assistants.
                    </p>
                  )}
                </div>
              </div>

              <div className="pro-card" style={{ flex: "1.4 1 460px", padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                      Working Part | Active Doings & Software Telemetry
                    </span>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                      {activeWorker.name}'s Current Doings
                    </h2>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#047857" }}>* LIVE</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {activeWorker.trackedApps.map((app, index) => (
                    <div key={app.appName} style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{app.appName}</strong>
                        <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>{app.status} | {app.lastPing}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", marginBottom: "10px" }}>{app.activeTask}</p>
                      <div className="modern-bar-track" style={{ marginBottom: "10px" }}>
                        <div
                          className="modern-bar-fill"
                          style={{
                            width: `${app.progress}%`,
                            background: `linear-gradient(90deg, ${department.accent} 0%, #334155 100%)`,
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Progress: {app.progress}%</span>
                        <button type="button" onClick={() => handleBumpAppProgress(index)} className="btn-secondary" style={{ padding: "5px 11px", fontSize: "12px" }}>
                          + Log Work Pulse
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>
                    DEPARTMENTAL KPIs ({department.code}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {department.kpis.map((kpi) => (
                      <span key={kpi} style={{ fontSize: "11.5px", padding: "4px 9px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: 600 }}>
                        {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="pro-card" style={{ padding: "22px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                Interdepartmental Coordination Timeline
              </h2>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px" }}>
                Log cross-departmental handoffs as work moves across supermarket teams
              </p>

              <form onSubmit={handleLogWorkflowHandoff} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <input type="text" className="pro-input" placeholder="Action update (e.g., Verified incoming stock batch & issued GRN)" value={handoffNote} onChange={(e) => setHandoffNote(e.target.value)} required />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" className="pro-input" style={{ flex: 1 }} placeholder="Doc Ref (e.g., GRN-2026-445)" value={handoffDoc} onChange={(e) => setHandoffDoc(e.target.value)} />
                  <button type="submit" className="btn-primary">Broadcast Handoff</button>
                </div>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                {timeline.map((t) => (
                  <div key={t.id} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <strong style={{ color: "#0f172a" }}>[{t.departmentCode}] {t.actorRole}</strong>
                      <span style={{ color: "#64748b", fontSize: "11.5px" }}>{t.documentRef} | {t.timestamp}</span>
                    </div>
                    <p style={{ color: "#334155" }}>{t.action}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "messages" && (
          <section className="pro-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div>
                <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>
                  Staff Chat Mode ({department.code})
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>Communicate securely with staff across departments</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => setEnterToSend(!enterToSend)} className="btn-secondary">
                  Chat Mode: {enterToSend ? "Enter to Send (ON)" : "Button Only"}
                </button>
                <button type="button" onClick={() => setShowCipherRaw(!showCipherRaw)} className="btn-secondary">
                  {showCipherRaw ? "Show Decrypted" : "Inspect Ciphertext"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>
                Shared Encryption Key:
              </label>
              <input type="password" className="pro-input" style={{ width: "100%", maxWidth: "360px" }} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "260px", maxHeight: "360px", overflowY: "auto", padding: "14px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "12px" }}>
              {deptChatMessages.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginTop: "90px" }}>
                  No encrypted messages in {department.code} yet.
                </p>
              ) : (
                deptChatMessages.map((msg) => {
                  const isMine = msg.senderName === activeWorker.name;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "82%",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        backgroundColor: isMine ? "#0f172a" : "#ffffff",
                        color: isMine ? "#ffffff" : "#0f172a",
                        border: isMine ? "1px solid #0f172a" : "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "11px", opacity: 0.8, marginBottom: "3px" }}>
                        <strong>{msg.senderName}</strong>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p style={{ fontSize: "13.5px", wordBreak: "break-word", fontFamily: showCipherRaw ? "monospace" : "inherit" }}>
                        {showCipherRaw ? `AES-GCM::${msg.cipherBase64}` : decryptedMap[msg.id] || "Decrypting..."}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendEncryptedChat} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                className="pro-input"
                style={{ flex: 1 }}
                placeholder={`Chat as ${activeWorker.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleDeptChatKeyDown}
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="pro-card" style={{ padding: "24px", maxWidth: "680px" }}>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
              Edit Profile - {activeWorker.name}
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
              Change your name, username, phone number, password, profile picture, and bio.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Avatar preview" style={{ width: "66px", height: "66px", borderRadius: "999px", objectFit: "cover", border: "2px solid #0f172a" }} />
                ) : (
                  <div style={{ width: "66px", height: "66px", borderRadius: "999px", background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "21px" }}>
                    {(editName || activeWorker.name).charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Profile Picture (Upload File or Paste Image URL)
                  </label>
                  <input type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ fontSize: "12.5px", marginBottom: "6px" }} />
                  <input type="text" className="pro-input" style={{ width: "100%" }} placeholder="https://example.com/photo.jpg" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <label style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                  <span>Name</span>
                  <input type="text" className="pro-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </label>

                <label style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                  <span>Username</span>
                  <input type="text" className="pro-input" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
                </label>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <label style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                  <span>Phone Number</span>
                  <input type="text" className="pro-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
                </label>

                <label style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                  <span>Password</span>
                  <input type="text" className="pro-input" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                <span>Bio</span>
                <textarea className="pro-textarea" rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Write your bio..." />
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button type="submit" className="btn-primary">Save Profile</button>
                {profileSavedMsg && <span style={{ fontSize: "13px", color: "#047857", fontWeight: 600 }}>[OK] {profileSavedMsg}</span>}
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
