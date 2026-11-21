"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEPARTMENTS, INITIAL_STAFF, StaffMember } from "@/lib/erpData";

export const STAFF_SHARED_PASSKEY = "staff123";

export default function UnifiedStaffLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [staffDirectory, setStaffDirectory] = useState<StaffMember[]>(INITIAL_STAFF);

  useEffect(() => {
    const saved = localStorage.getItem("sm_erp_staff");
    if (saved) {
      try {
        const parsed: StaffMember[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStaffDirectory(parsed);
        }
      } catch {}
    }
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanInput = name.trim().toLowerCase();

    const execRecord =
      staffDirectory.find((s) => s.id === "EMP-1001") || INITIAL_STAFF[0];
    const execNames = [
      execRecord.name.toLowerCase(),
      execRecord.username.toLowerCase(),
      "collins musa",
    ];
    const execPass = execRecord.password || "eucabeth1musa";

    // 1. Senior Executive Admin (EXEC-01)
    if (execNames.includes(cleanInput) && password === execPass) {
      document.cookie = "staff_admin_auth=1; path=/; max-age=86400";
      localStorage.setItem(
        "sm_erp_session",
        JSON.stringify({
          role: "SENIOR_EXEC_ADMIN",
          staffId: execRecord.id,
          name: execRecord.name,
          departmentCode: "EXEC-01",
        })
      );
      router.push("/dashboard");
      return;
    }

    // 2. Department Staff / Dept Executive Admin / Strategy Co-Admin
    const matchedStaff = staffDirectory.find(
      (member) =>
        member.name.toLowerCase() === cleanInput ||
        member.username.toLowerCase() === cleanInput
    );

    if (
      matchedStaff &&
      (password === matchedStaff.password ||
        password === matchedStaff.badgeCode ||
        password === STAFF_SHARED_PASSKEY)
    ) {
      const dept =
        DEPARTMENTS.find((d) => d.code === matchedStaff.departmentCode) || DEPARTMENTS[0];

      document.cookie = "staff_admin_auth=1; path=/; max-age=86400";
      localStorage.setItem(
        "sm_erp_session",
        JSON.stringify({
          role: "DEPT_STAFF",
          staffId: matchedStaff.id,
          name: matchedStaff.name,
          departmentCode: matchedStaff.departmentCode,
        })
      );
      router.push(`/departments/${dept.slug}`);
      return;
    }

    setError(
      "Invalid credentials. Enter your registered Name/Username and Password or Badge Code."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="pro-card"
        style={{
          width: "100%",
          maxWidth: "880px",
          display: "flex",
          flexWrap: "wrap",
          overflow: "hidden",
        }}
      >
        <section
          style={{
            flex: "1 1 320px",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
            borderRight: "1px solid #e2e8f0",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "5px 11px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                backgroundColor: "#e2e8f0",
                color: "#0f172a",
                marginBottom: "16px",
              }}
            >
              SM-ORG-001 • Staff Portal
            </span>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: 1.25,
                color: "#0f172a",
                marginBottom: "12px",
              }}
            >
              Supermarket StaffApp
            </h1>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
              Unified sign-in gateway for all supermarket team members. Your credentials
              automatically route you to your assigned role and department dashboard.
            </p>
          </div>

          <div
            style={{
              marginTop: "28px",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Executive Command • 9 Store Departments • Role-Routed Dashboards
          </div>
        </section>

        <section
          style={{
            flex: "1 1 340px",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <h2
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Staff & Executive Sign In
          </h2>
          <p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "22px" }}>
            Sign in with your full name or username and password.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              <span>Name or Username</span>
              <input
                type="text"
                className="pro-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or username"
                autoComplete="username"
                required
              />
            </label>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              <span>Password</span>
              <input
                type="password"
                className="pro-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: "4px", padding: "12px 16px" }}
            >
              Sign In to Dashboard →
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
