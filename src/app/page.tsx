"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (username.trim() === "admin" && password === "admin123") {
      document.cookie = "staff_admin_auth=1; path=/; max-age=86400";
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Use admin / admin123.");
    }
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
              SM-ORG-001 • Executive Portal
            </span>
            <h1 style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.25, color: "#0f172a", marginBottom: "12px" }}>
              Supermarket StaffApp
            </h1>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
              Senior Executive Admin workspace for board & shareholder oversight, supermarket
              transaction tracking, strategy co-admin appointments, and departmental control.
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
            Executive & Senior Management (EXEC-01) • 9 Store Departments
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
          <h2 style={{ fontSize: "21px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
            Senior Executive Sign In
          </h2>
          <p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "22px" }}>
            Sign in to access Executive & Senior Management command.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
              <span>Username</span>
              <input
                type="text"
                className="pro-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
              <span>Password</span>
              <input
                type="password"
                className="pro-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

            <button type="submit" className="btn-primary" style={{ marginTop: "4px", padding: "12px 16px" }}>
              Enter Senior Executive Portal →
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
