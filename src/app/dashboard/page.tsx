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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);

  // Admin Appointment Form State
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("HR-06");
  const [newLevel, setNewLevel] = useState<StaffMember["level"]>("Level 3: Management");
  const [appointBanner, setAppointBanner] = useState("");

  useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith("staff_admin_auth=1"));

    if (!hasAuth) {
      router.replace("/");
      return;
    }
    setAuthorized(true);

    const savedStaff = localStorage.getItem("sm_erp_staff");
    if (savedStaff) {
      try {
        setStaffList(JSON.parse(savedStaff));
      } catch {}
    }

    const savedTimeline = localStorage.getItem("sm_erp_timeline");
    if (savedTimeline) {
      try {
        setTimeline(JSON.parse(savedTimeline));
      } catch {}
    }
  }, [router]);

  function handleLogout() {
    document.cookie = "staff_admin_auth=; path=/; max-age=0";
    router.push("/");
  }

  function handleAppointStaff(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) return;

    const deptObj = DEPARTMENTS.find((d) => d.code === newDept);
    const created: StaffMember = {
      id: `EMP-${Math.floor(1010 + Math.random() * 8900)}`,
      name: newName.trim(),
      title: newTitle.trim(),
      level: newLevel,
      departmentCode: newDept,
      clearance: newLevel.includes("Executive")
        ? "L4-GLOBAL"
        : newLevel.includes("Management")
        ? "L3-DEPT-MGR"
        : "L2-OPS-STAFF",
      shift: "08:00 - 17:00 EAT",
      email: `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@supermarket-erp.local`,
      badgeCode: `SM-${newDept}-${Math.floor(100 + Math.random() * 899)}`,
      trackedApps: [
        {
          appName: `${deptObj?.name || newDept} Core ERP Module`,
          activeTask: `Initialized ${newTitle.trim()} workstation & KPIs`,
          progress: 100,
          status: "Running",
          lastPing: "Just now",
        },
        {
          appName: "Interdepartmental Workflow Sync",
          activeTask: "Listening for real-time handoff triggers",
          progress: 85,
          status: "Syncing",
          lastPing: "Just now",
        },
      ],
    };

    const updatedStaff = [created, ...staffList];
    setStaffList(updatedStaff);
    localStorage.setItem("sm_erp_staff", JSON.stringify(updatedStaff));

    const newEvent: TimelineEvent = {
      id: `TL-${Date.now()}`,
      workflow: "Workflow 3: Employee Appointment & Assignment",
      stepNumber: timeline.length + 1,
      departmentCode: newDept,
      actorRole: "Admin / Executive Command",
      action: `Appointed ${created.name} as ${created.title} in ${deptObj?.name}.`,
      documentRef: `APPT-${created.id}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Completed",
    };
    const updatedTimeline = [newEvent, ...timeline];
    setTimeline(updatedTimeline);
    localStorage.setItem("sm_erp_timeline", JSON.stringify(updatedTimeline));

    setAppointBanner(`Appointed ${created.name} (${created.title}) to ${deptObj?.name}.`);
    setNewName("");
    setNewTitle("");
  }

  if (!authorized) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#cbd5e1" }}>Verifying admin session...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", maxWidth: "1280px", margin: "0 auto", padding: "24px 18px 60px" }}>
      {/* Top Glass Header */}
      <header
        className="glass-card"
        style={{
          padding: "22px 26px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6ee7b7", fontWeight: 600 }}>
            SM-ORG-001 • Enterprise Supermarket ERP
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: 700, marginTop: "4px" }}>
            Executive & Admin Command Portal
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px" }}>
            Appoint departmental leadership, track real-time product receiving & workflows, or open any department hub.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#6ee7b7",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {staffList.length} Active Personnel • {DEPARTMENTS.length} Departments
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Appointment & Live Interdepartmental Timeline Row */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
        {/* Appoint Staff to Department Card */}
        <div className="glass-card" style={{ flex: "1 1 380px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
            Appoint & Deploy Staff Member
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
            Assign an HR Manager, Receiving Officer, or specialist directly into their department workspace.
          </p>

          <form onSubmit={handleAppointStaff} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Staff Full Name (e.g., Jane Muthoni)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#f8fafc",
                fontSize: "14px",
              }}
            />

            <input
              type="text"
              placeholder="Role Title (e.g., HR Manager / Returning Officer)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#f8fafc",
                fontSize: "14px",
              }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                style={{
                  flex: "1 1 170px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#0f172a",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>

              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as StaffMember["level"])}
                style={{
                  flex: "1 1 160px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "#0f172a",
                  color: "#f8fafc",
                  fontSize: "13px",
                }}
              >
                <option value="Level 1: Governance">Level 1: Governance</option>
                <option value="Level 2: Executive">Level 2: Executive</option>
                <option value="Level 3: Management">Level 3: Management</option>
                <option value="Level 4: Operational">Level 4: Operational</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10b981, #0ea5e9)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Appoint to Department
            </button>

            {appointBanner && (
              <p style={{ fontSize: "12.5px", color: "#6ee7b7", marginTop: "4px" }}>
                ✓ {appointBanner}
              </p>
            )}
          </form>
        </div>

        {/* Real-Time Interdepartmental Coordination Timeline */}
        <div className="glass-card" style={{ flex: "2 1 520px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                Real-Time Interdepartmental Timeline
              </h2>
              <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                Live coordination from Stock Requisition → PO → Receiving Bay → Inventory → Finance
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600 }}>● LIVE SYNC</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
            {timeline.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.55)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(56, 189, 248, 0.18)",
                        color: "#38bdf8",
                      }}
                    >
                      {item.departmentCode}
                    </span>
                    <strong style={{ fontSize: "13px", color: "#f8fafc" }}>{item.actorRole}</strong>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>({item.documentRef})</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#cbd5e1" }}>{item.action}</p>
                </div>

                <div style={{ textAlign: "right", fontSize: "12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      background:
                        item.status === "Completed"
                          ? "rgba(16, 185, 129, 0.2)"
                          : item.status === "In Progress"
                          ? "rgba(251, 191, 36, 0.2)"
                          : "rgba(148, 163, 184, 0.2)",
                      color:
                        item.status === "Completed"
                          ? "#6ee7b7"
                          : item.status === "In Progress"
                          ? "#fde047"
                          : "#cbd5e1",
                    }}
                  >
                    {item.status}
                  </span>
                  <div style={{ color: "#94a3b8", marginTop: "4px" }}>{item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 9 Department Glassmorphism Cards */}
      <h2 style={{ fontSize: "19px", fontWeight: 700, marginBottom: "14px" }}>
        Supermarket Departmental Sections (Click to Enter Department Portal)
      </h2>
      <section style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {DEPARTMENTS.map((dept) => {
          const deptStaffCount = staffList.filter((s) => s.departmentCode === dept.code).length;
          return (
            <Link
              key={dept.code}
              href={`/departments/${dept.slug}`}
              style={{
                flex: "1 1 320px",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
              }}
            >
              <article
                className="glass-card dept-card"
                style={{
                  width: "100%",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.09)",
                        color: dept.accent,
                        border: `1px solid ${dept.accent}55`,
                      }}
                    >
                      {dept.badge}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>{dept.code}</span>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#f8fafc" }}>
                    {dept.name}
                  </h3>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "#cbd5e1", marginBottom: "12px" }}>
                    {dept.purpose}
                  </p>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    <strong style={{ color: "#e2e8f0" }}>Key Specialists:</strong>{" "}
                    {dept.specialists.slice(0, 3).join(", ")} +{dept.specialists.length - 3} more
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: "14px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#6ee7b7", fontWeight: 600 }}>
                    ● {deptStaffCount} Assigned Staff
                  </span>
                  <span style={{ color: dept.accent, fontWeight: 600 }}>
                    Open Department Hub →
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
