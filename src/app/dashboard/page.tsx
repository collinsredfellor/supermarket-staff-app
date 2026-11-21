"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEPARTMENTS,
  GOVERNANCE_MEMBERS,
  INITIAL_STAFF,
  INITIAL_TIMELINE,
  INITIAL_TRANSACTIONS,
  StaffMember,
  SupermarketTransaction,
  TimelineEvent,
  getRankScoreForLevel,
} from "@/lib/erpData";
import {
  EncryptedChatMessage,
  encryptMessage,
  decryptMessage,
} from "@/lib/cryptoChat";

type NavTab = "home" | "messages" | "profile";

export default function SeniorExecutiveDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [currentUserId, setCurrentUserId] = useState<string>("EMP-1001");
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [transactions] = useState<SupermarketTransaction[]>(INITIAL_TRANSACTIONS);

  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("EXEC-01");
  const [newLevel, setNewLevel] = useState<StaffMember["level"]>("Level 3: Management");
  const [newRankScore, setNewRankScore] = useState(80);
  const [makeStrategyCoAdmin, setMakeStrategyCoAdmin] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const [passphrase, setPassphrase] = useState("SM-ORG-001-SECURE");
  const [chatInput, setChatInput] = useState("");
  const [encryptedMessages, setEncryptedMessages] = useState<EncryptedChatMessage[]>([]);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [showCipherRaw, setShowCipherRaw] = useState(false);

  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBio, setEditBio] = useState("");
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith("staff_admin_auth=1"));

    if (!hasAuth) {
      router.replace("/");
      return;
    }

    let loadedStaff: StaffMember[] = INITIAL_STAFF;
    const savedStaff = localStorage.getItem("sm_erp_staff");
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedStaff = parsed;
          setStaffList(parsed);
        }
      } catch {
        // ignore invalid storage
      }
    }

    let activeId = "EMP-1001";
    const rawSession = localStorage.getItem("sm_erp_session");
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession) as {
          role?: string;
          departmentCode?: string;
          staffId?: string;
        };
        if (session.role !== "SENIOR_EXEC_ADMIN") {
          const targetDept =
            DEPARTMENTS.find((d) => d.code === session.departmentCode) || DEPARTMENTS[0];
          router.replace(`/departments/${targetDept.slug}`);
          return;
        }
        if (session.staffId) {
          activeId = session.staffId;
        }
      } catch {
        // ignore invalid session
      }
    }

    setCurrentUserId(activeId);
    const me = loadedStaff.find((s) => s.id === activeId) || loadedStaff[0];
    if (me) {
      setEditName(me.name);
      setEditUsername(me.username);
      setEditPhone(me.phone);
      setEditPassword(me.password);
      setEditAvatarUrl(me.avatarUrl || "");
      setEditBio(me.bio || "");
    }

    setAuthorized(true);

    const savedTimeline = localStorage.getItem("sm_erp_timeline");
    if (savedTimeline) {
      try {
        setTimeline(JSON.parse(savedTimeline));
      } catch {
        // ignore invalid timeline
      }
    }

    const savedChat = localStorage.getItem("sm_erp_encrypted_chat");
    if (savedChat) {
      try {
        setEncryptedMessages(JSON.parse(savedChat));
      } catch {
        // ignore invalid chat
      }
    }
  }, [router]);

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

  const currentUser =
    staffList.find((s) => s.id === currentUserId) || staffList[0] || INITIAL_STAFF[0];

  function persistStaff(next: StaffMember[]) {
    setStaffList(next);
    localStorage.setItem("sm_erp_staff", JSON.stringify(next));
  }

  function handleLogout() {
    document.cookie = "staff_admin_auth=; path=/; max-age=0";
    localStorage.removeItem("sm_erp_session");
    router.push("/");
  }

  function handleAppointOrAssign(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) return;

    const deptObj = DEPARTMENTS.find((d) => d.code === newDept);
    const slugName = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".");
    const created: StaffMember = {
      id: `EMP-${Math.floor(1010 + Math.random() * 8900)}`,
      name: newName.trim(),
      username: slugName,
      phone: "+254 700 000 000",
      password: "staff123",
      avatarUrl: "",
      bio: `${newTitle.trim()} assigned to ${deptObj?.name || newDept}.`,
      title: newTitle.trim(),
      level: newLevel,
      rankScore: Number(newRankScore) || getRankScoreForLevel(newLevel),
      departmentCode: newDept,
      clearance: makeStrategyCoAdmin
        ? "L3-STRATEGY-CO-ADMIN"
        : newLevel.includes("Executive")
        ? "L4-EXEC"
        : "L2-DEPT-STAFF",
      shift: "08:00 - 17:00 EAT",
      email: `${slugName}@supermarket-erp.local`,
      badgeCode: `SM-${newDept}-${Math.floor(100 + Math.random() * 899)}`,
      isStrategyCoAdmin: makeStrategyCoAdmin,
      trackedApps: [
        {
          appName: `${deptObj?.name || newDept} Strategy & Ops Suite`,
          activeTask: `Coordinating ${newTitle.trim()} deliverables`,
          progress: 88,
          status: "Running",
          lastPing: "Just now",
        },
        {
          appName: "Interdepartmental Workflow Sync",
          activeTask: "Monitoring live cross-department handoffs",
          progress: 92,
          status: "Syncing",
          lastPing: "Just now",
        },
      ],
    };

    const updatedStaff = [created, ...staffList];
    persistStaff(updatedStaff);

    const logEntry: TimelineEvent = {
      id: `TL-${Date.now()}`,
      workflow: "Executive Governance & Strategy Assignment",
      stepNumber: timeline.length + 1,
      departmentCode: newDept,
      actorRole: `${currentUser.name} (Senior Exec Admin)`,
      action: `${makeStrategyCoAdmin ? "Appointed Strategy Co-Admin " : "Assigned "}${created.name} (${created.title}) in ${deptObj?.name}.`,
      documentRef: `EXEC-${created.id}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Completed",
    };
    const updatedTimeline = [logEntry, ...timeline];
    setTimeline(updatedTimeline);
    localStorage.setItem("sm_erp_timeline", JSON.stringify(updatedTimeline));

    setStatusMessage(
      `${created.name} added to ${deptObj?.code}${makeStrategyCoAdmin ? " as Strategy Co-Admin" : ""}.`
    );
    setNewName("");
    setNewTitle("");
  }

  function toggleStrategyCoAdmin(staffId: string) {
    const updated = staffList.map((member) =>
      member.id === staffId
        ? {
            ...member,
            isStrategyCoAdmin: !member.isStrategyCoAdmin,
            clearance: !member.isStrategyCoAdmin ? "L3-STRATEGY-CO-ADMIN" : "L2-DEPT-STAFF",
          }
        : member
    );
    persistStaff(updated);
  }

  async function handleSendEncryptedChat(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const { ivBase64, cipherBase64 } = await encryptMessage(chatInput.trim(), passphrase);
    const newMsg: EncryptedChatMessage = {
      id: `MSG-${Date.now()}`,
      departmentCode: "EXEC-01",
      senderName: currentUser.name,
      senderRole: currentUser.title,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ivBase64,
      cipherBase64,
    };
    const updated = [...encryptedMessages, newMsg];
    setEncryptedMessages(updated);
    localStorage.setItem("sm_erp_encrypted_chat", JSON.stringify(updated));
    setChatInput("");
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
    const updated = staffList.map((member) =>
      member.id === currentUser.id
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
    localStorage.setItem(
      "sm_erp_session",
      JSON.stringify({
        role: "SENIOR_EXEC_ADMIN",
        staffId: currentUser.id,
        name: editName.trim() || currentUser.name,
        departmentCode: "EXEC-01",
      })
    );
    setProfileSavedMsg("Profile details updated.");
  }

  if (!authorized) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#475569" }}>Verifying Senior Executive session...</p>
      </main>
    );
  }

  const execDept = DEPARTMENTS[0];
  const maxDeptRev = Math.max(...DEPARTMENTS.map((d) => d.weeklyRevenueK));
  const totalTransactionsKes = transactions.reduce((sum, t) => sum + t.amountKes, 0);

  const trendPoints = [
    { label: "W1", rev: 340, cost: 220 },
    { label: "W2", rev: 375, cost: 235 },
    { label: "W3", rev: 360, cost: 240 },
    { label: "W4", rev: 410, cost: 255 },
    { label: "W5", rev: 445, cost: 270 },
    { label: "W6", rev: 482, cost: 291 },
  ];

  const revPolyline = trendPoints
    .map((p, i) => `${55 + i * 78},${165 - (p.rev / 520) * 125}`)
    .join(" ");

  const costPolyline = trendPoints
    .map((p, i) => `${55 + i * 78},${165 - (p.cost / 520) * 125}`)
    .join(" ");

  return (
    <>
      <nav className="insta-dock" aria-label="Workspace Navigation">
        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Messages</span>
        </button>

        <button
          type="button"
          className={`insta-dock-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "999px",
                  objectFit: "cover",
                  border: "2px solid #0f172a",
                }}
              />
            ) : (
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "999px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                }}
              >
                EXEC-01 | SENIOR EXECUTIVE ADMIN
              </span>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginTop: "6px" }}>
                {currentUser.name} - Executive & Senior Management
              </h1>
              <p style={{ color: "#475569", fontSize: "13px", marginTop: "2px" }}>
                Current Doings: {currentUser.trackedApps[0]?.activeTask || execDept.purpose}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            <Link
              href="/departments/exec-01"
              className="btn-secondary"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Open EXEC-01 Hub
            </Link>
            <button type="button" onClick={handleLogout} className="btn-primary">
              Sign Out
            </button>
          </div>
        </header>

        {activeTab === "home" && (
          <>
            <section className="pro-card" style={{ padding: "18px 22px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "10px" }}>
                LIVE DOINGS & ACTIVE WORK TRACKER ({currentUser.name.toUpperCase()})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                {currentUser.trackedApps.map((app) => (
                  <div
                    key={app.appName}
                    style={{
                      flex: "1 1 280px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      <span>{app.appName}</span>
                      <span style={{ color: "#047857" }}>{app.progress}%</span>
                    </div>
                    <p style={{ fontSize: "12.5px", color: "#475569" }}>{app.activeTask}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
              <div className="pro-card" style={{ flex: "1 1 210px", padding: "18px 20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>EXEC-01 WEEKLY REVENUE</div>
                <div style={{ fontSize: "23px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                  KES {execDept.weeklyRevenueK.toLocaleString()},000
                </div>
                <div style={{ fontSize: "12px", color: "#047857", fontWeight: 600, marginTop: "4px" }}>
                  +8.3% vs prior period
                </div>
              </div>

              <div className="pro-card" style={{ flex: "1 1 210px", padding: "18px 20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>TRACKED TRANSACTIONS</div>
                <div style={{ fontSize: "23px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                  KES {totalTransactionsKes.toLocaleString()}
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                  {transactions.length} ledger entries
                </div>
              </div>

              <div className="pro-card" style={{ flex: "1 1 210px", padding: "18px 20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>SHAREHOLDERS & BOARD</div>
                <div style={{ fontSize: "23px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                  {GOVERNANCE_MEMBERS.length} Members
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>Governance council</div>
              </div>

              <div className="pro-card" style={{ flex: "1 1 210px", padding: "18px 20px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>STRATEGY CO-ADMINS</div>
                <div style={{ fontSize: "23px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                  {staffList.filter((s) => s.isStrategyCoAdmin).length} Appointed
                </div>
                <div style={{ fontSize: "12px", color: "#0369a1", fontWeight: 600, marginTop: "4px" }}>
                  Department strategy leads
                </div>
              </div>
            </section>

            <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "22px" }}>
              <div className="pro-card" style={{ flex: "1.1 1 400px", padding: "22px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                      Executive Revenue vs. Cost Graph
                    </h2>
                    <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                      6-cycle performance curve (KES in 10,000s)
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", fontWeight: 600 }}>
                    <span style={{ color: "#0f172a" }}>* Revenue</span>
                    <span style={{ color: "#0369a1" }}>* Cost</span>
                  </div>
                </div>

                <svg viewBox="0 0 520 200" style={{ width: "100%", height: "auto", display: "block" }}>
                  <line x1="50" y1="165" x2="495" y2="165" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50" y1="30" x2="50" y2="165" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50" y1="100" x2="495" y2="100" stroke="#e2e8f0" strokeDasharray="4 4" />
                  <polyline fill="none" stroke="#0f172a" strokeWidth="3" points={revPolyline} />
                  <polyline fill="none" stroke="#0369a1" strokeWidth="2.5" strokeDasharray="5 3" points={costPolyline} />
                  {trendPoints.map((pt, idx) => {
                    const x = 55 + idx * 78;
                    const y = 165 - (pt.rev / 520) * 125;
                    return (
                      <g key={pt.label}>
                        <circle cx={x} cy={y} r="4.5" fill="#0f172a" />
                        <text x={x} y="185" textAnchor="middle" fontSize="11" fill="#475569">
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="pro-card" style={{ flex: "1.2 1 440px", padding: "22px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Departmental Contribution Bars
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "14px" }}>
                  Weekly throughput and KPI across all 9 departments
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {DEPARTMENTS.map((dept) => {
                    const widthPct = Math.round((dept.weeklyRevenueK / maxDeptRev) * 100);
                    return (
                      <div key={dept.code}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <strong style={{ color: "#0f172a" }}>
                            {dept.code} - {dept.name}
                          </strong>
                          <span style={{ color: "#475569", fontWeight: 600 }}>
                            KES {dept.weeklyRevenueK.toLocaleString()}k | KPI {dept.kpiScore}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "9px",
                            borderRadius: "999px",
                            backgroundColor: "#e2e8f0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${widthPct}%`,
                              height: "100%",
                              backgroundColor: dept.accent,
                              borderRadius: "999px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "22px" }}>
              <div className="pro-card" style={{ flex: "1.2 1 440px", padding: "22px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Shareholders, Board of Directors & Executive Council
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "14px" }}>
                  Governance members and equity holders under Executive & Senior Management
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {GOVERNANCE_MEMBERS.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{member.name}</strong>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "999px",
                              backgroundColor: "#e2e8f0",
                              color: "#0f172a",
                            }}
                          >
                            {member.category}
                          </span>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#475569", marginTop: "2px" }}>
                          {member.role} | {member.committee}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                        {member.equityOrTerm}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pro-card" style={{ flex: "1 1 390px", padding: "22px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Appoint Strategy Co-Admin / Staff
                </h2>
                <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "14px" }}>
                  Appoint admins to assist with department strategies
                </p>

                <form
                  onSubmit={handleAppointOrAssign}
                  style={{ display: "flex", flexDirection: "column", gap: "11px" }}
                >
                  <input
                    type="text"
                    className="pro-input"
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="pro-input"
                    placeholder="Strategy / Role Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <select
                      className="pro-select"
                      style={{ flex: "1 1 170px" }}
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="pro-select"
                      style={{ flex: "1 1 150px" }}
                      value={newLevel}
                      onChange={(e) => {
                        const lvl = e.target.value as StaffMember["level"];
                        setNewLevel(lvl);
                        setNewRankScore(getRankScoreForLevel(lvl));
                      }}
                    >
                      <option value="Level 2: Executive">Level 2: Executive</option>
                      <option value="Level 3: Management">Level 3: Management</option>
                      <option value="Level 4: Operational">Level 4: Operational</option>
                    </select>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12.5px",
                      color: "#334155",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={makeStrategyCoAdmin}
                      onChange={(e) => setMakeStrategyCoAdmin(e.target.checked)}
                    />
                    Appoint as Department Strategy Co-Admin
                  </label>

                  <button type="submit" className="btn-primary">
                    Save Appointment
                  </button>

                  {statusMessage && (
                    <p style={{ fontSize: "12.5px", color: "#047857", fontWeight: 600 }}>
                      [OK] {statusMessage}
                    </p>
                  )}
                </form>

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    STRATEGY CO-ADMIN ACCESS TOGGLE
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      maxHeight: "110px",
                      overflowY: "auto",
                    }}
                  >
                    {staffList.slice(0, 6).map((person) => (
                      <div
                        key={person.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <span>
                          <strong>{person.name}</strong> ({person.departmentCode})
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleStrategyCoAdmin(person.id)}
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          {person.isStrategyCoAdmin ? "Co-Admin: ON" : "Make Co-Admin"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="pro-card" style={{ padding: "22px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                Supermarket Transaction Details
              </h2>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "14px" }}>
                Live sales, supplier payments, goods received notes, and payroll transactions
              </p>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <th style={{ padding: "10px 12px" }}>Ref</th>
                      <th style={{ padding: "10px 12px" }}>Type</th>
                      <th style={{ padding: "10px 12px" }}>Dept</th>
                      <th style={{ padding: "10px 12px" }}>Counterparty</th>
                      <th style={{ padding: "10px 12px" }}>Channel</th>
                      <th style={{ padding: "10px 12px" }}>Amount (KES)</th>
                      <th style={{ padding: "10px 12px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{tx.reference}</td>
                        <td style={{ padding: "10px 12px" }}>{tx.type}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{tx.departmentCode}</td>
                        <td style={{ padding: "10px 12px", color: "#334155" }}>{tx.counterparty}</td>
                        <td style={{ padding: "10px 12px", color: "#64748b" }}>{tx.channel}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                          KES {tx.amountKes.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              backgroundColor:
                                tx.status === "Pending Approval" ? "#fef3c7" : "#dcfce7",
                              color:
                                tx.status === "Pending Approval" ? "#92400e" : "#166534",
                            }}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Departmental Workspaces (Highest-Ranked Member = Department Executive Admin)
            </h2>
            <section style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
              {DEPARTMENTS.map((dept) => {
                const deptWorkers = staffList
                  .filter((s) => s.departmentCode === dept.code)
                  .sort((a, b) => b.rankScore - a.rankScore);
                const execAdmin = deptWorkers[0];

                return (
                  <Link
                    key={dept.code}
                    href={`/departments/${dept.slug}`}
                    style={{
                      flex: "1 1 300px",
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                    }}
                  >
                    <article
                      className="pro-card pro-dept-card"
                      style={{
                        width: "100%",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: "6px",
                              backgroundColor: "#f1f5f9",
                              color: dept.accent,
                            }}
                          >
                            {dept.code} | {dept.badge}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                            KPI {dept.kpiScore}%
                          </span>
                        </div>
                        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                          {dept.name}
                        </h3>
                        <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#475569", marginBottom: "10px" }}>
                          {dept.purpose}
                        </p>
                        {execAdmin && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#0f172a",
                              backgroundColor: "#f8fafc",
                              padding: "8px 10px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <strong>Dept Executive Admin:</strong> {execAdmin.name}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          paddingTop: "12px",
                          borderTop: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12.5px",
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: "#475569" }}>{deptWorkers.length} Staff Assigned</span>
                        <span style={{ color: "#0f172a" }}>Open Department -></span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </section>
          </>
        )}

        {activeTab === "messages" && (
          <section className="pro-card" style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>
                  Staff Encrypted Communication
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  AES-256 encrypted channel for executive & departmental coordination
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCipherRaw(!showCipherRaw)}
                className="btn-secondary"
              >
                {showCipherRaw ? "Show Decrypted" : "Inspect Ciphertext"}
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Shared Channel Key:
              </label>
              <input
                type="password"
                className="pro-input"
                style={{ width: "100%", maxWidth: "360px" }}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minHeight: "260px",
                maxHeight: "360px",
                overflowY: "auto",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: "12px",
              }}
            >
              {encryptedMessages.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginTop: "90px" }}>
                  No staff messages yet. Send a message below.
                </p>
              ) : (
                encryptedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11.5px",
                        color: "#64748b",
                        marginBottom: "3px",
                      }}
                    >
                      <strong style={{ color: "#0f172a" }}>
                        {msg.senderName} ({msg.departmentCode})
                      </strong>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: showCipherRaw ? "#b45309" : "#0f172a",
                        wordBreak: "break-word",
                        fontFamily: showCipherRaw ? "monospace" : "inherit",
                      }}
                    >
                      {showCipherRaw
                        ? `AES-GCM::${msg.cipherBase64}`
                        : decryptedMap[msg.id] || "Decrypting..."}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendEncryptedChat} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                className="pro-input"
                style={{ flex: 1 }}
                placeholder={`Write encrypted message as ${currentUser.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="pro-card" style={{ padding: "24px", maxWidth: "680px" }}>
            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
              Edit Profile & Credentials
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
              Update your name, username, phone number, password, profile picture, and bio.
            </p>

            <form
              onSubmit={handleSaveProfile}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {editAvatarUrl ? (
                  <img
                    src={editAvatarUrl}
                    alt="Profile preview"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "999px",
                      objectFit: "cover",
                      border: "2px solid #0f172a",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "999px",
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "20px",
                    }}
                  >
                    {(editName || currentUser.name).charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Profile Picture (Upload Image or Paste URL)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    style={{ fontSize: "12.5px", marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    className="pro-input"
                    style={{ width: "100%" }}
                    placeholder="https://example.com/photo.jpg"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <label
                  style={{
                    flex: "1 1 260px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <span>Full Name</span>
                  <input
                    type="text"
                    className="pro-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </label>

                <label
                  style={{
                    flex: "1 1 260px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <span>Username</span>
                  <input
                    type="text"
                    className="pro-input"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <label
                  style={{
                    flex: "1 1 260px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <span>Phone Number</span>
                  <input
                    type="text"
                    className="pro-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </label>

                <label
                  style={{
                    flex: "1 1 260px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <span>Password</span>
                  <input
                    type="text"
                    className="pro-input"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <span>Bio</span>
                <textarea
                  className="pro-textarea"
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write your role summary or bio..."
                />
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button type="submit" className="btn-primary">
                  Save Profile Changes
                </button>
                {profileSavedMsg && (
                  <span style={{ fontSize: "13px", color: "#047857", fontWeight: 600 }}>
                    [OK] {profileSavedMsg}
                  </span>
                )}
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
