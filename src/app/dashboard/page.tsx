"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith("staff_admin_auth=1"));

    if (!hasAuth) {
      router.replace("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  function handleLogout() {
    document.cookie = "staff_admin_auth=; path=/; max-age=0";
    router.push("/");
  }

  if (!authorized) {
    return (
      <main style={{ maxWidth: 600, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>Welcome Admin</h1>
          <p style={{ color: "#555", marginTop: 6 }}>
            Supermarket StaffApp — Admin Portal Baseline
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#e5e7eb",
            color: "#111827",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}
