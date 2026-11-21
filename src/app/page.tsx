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

    // Simple baseline check for initial UI flow
    if (username.trim() === "admin" && password === "admin123") {
      document.cookie = "staff_admin_auth=1; path=/; max-age=86400";
      router.push("/dashboard");
    } else {
      setError("Invalid admin credentials. Try admin / admin123.");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Supermarket StaffApp</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>Admin Sign In</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
          />
        </label>

        {error && <p style={{ color: "#b91c1c", fontSize: 14, margin: 0 }}>{error}</p>}

        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: 10,
            backgroundColor: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
