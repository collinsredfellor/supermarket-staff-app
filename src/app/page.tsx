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
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "880px",
          display: "flex",
          flexWrap: "wrap",
          overflow: "hidden",
        }}
      >
        {/* Left Branding Panel */}
        <section
          style={{
            flex: "1 1 320px",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(160deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.12))",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "rgba(16, 185, 129, 0.2)",
                color: "#6ee7b7",
                border: "1px solid rgba(110, 231, 183, 0.35)",
                marginBottom: "18px",
              }}
            >
              Enterprise Retail Suite
            </span>
            <h1 style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2, marginBottom: "12px" }}>
              Supermarket StaffApp
            </h1>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6 }}>
              Centralized administrative command for store departments, inventory flow,
              procurement, finance, and staff operations.
            </p>
          </div>

          <div
            style={{
              marginTop: "28px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            9 Active Store Departments • Role-Based Control
          </div>
        </section>

        {/* Right Sign-In Flex Card Section */}
        <section
          style={{
            flex: "1 1 340px",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "6px" }}>
            Admin Portal Sign In
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
            Enter your administrator credentials to manage departments.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#e2e8f0" }}>
              <span>Admin Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(15, 23, 42, 0.55)",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#e2e8f0" }}>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(15, 23, 42, 0.55)",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.18)",
                  border: "1px solid rgba(248, 113, 113, 0.4)",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: "6px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10b981, #0ea5e9)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
              }}
            >
              Access Admin Dashboard →
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
