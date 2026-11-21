"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  badge: string;
  accent: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "executive",
    name: "Executive & Senior Management",
    code: "EXEC-01",
    description: "Store-wide strategy, branch oversight, policy approvals, and executive KPIs.",
    badge: "Leadership",
    accent: "#38bdf8",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    code: "FIN-02",
    description: "Daily cash reconciliations, supplier ledgers, tax compliance, and audit trails.",
    badge: "Fiscal",
    accent: "#34d399",
  },
  {
    id: "procurement",
    name: "Procurement & Purchasing",
    code: "PROC-03",
    description: "Vendor contracts, purchase orders, restock negotiations, and cost optimization.",
    badge: "Sourcing",
    accent: "#a78bfa",
  },
  {
    id: "inventory",
    name: "Inventory & Warehouse",
    code: "INV-04",
    description: "Stock levels, cold-chain storage, batch tracking, and shelf replenishment.",
    badge: "Stock Control",
    accent: "#fbbf24",
  },
  {
    id: "sales",
    name: "Sales & Customer Service",
    code: "SLS-05",
    description: "POS checkout operations, loyalty promotions, returns desk, and shopper care.",
    badge: "Frontline",
    accent: "#f472b6",
  },
  {
    id: "hr",
    name: "Human Resources",
    code: "HR-06",
    description: "Shift rosters, staff onboarding, attendance tracking, and payroll coordination.",
    badge: "People Ops",
    accent: "#fb7185",
  },
  {
    id: "it",
    name: "Information Technology",
    code: "IT-07",
    description: "POS terminals, barcode scanners, network uptime, and internal system security.",
    badge: "Systems",
    accent: "#22d3ee",
  },
  {
    id: "logistics",
    name: "Logistics & Transport",
    code: "LOG-08",
    description: "Fleet dispatch, supplier receiving bays, and inter-branch stock transfers.",
    badge: "Supply Chain",
    accent: "#fb923c",
  },
  {
    id: "branding",
    name: "Branding",
    code: "BRD-09",
    description: "In-store signage, seasonal campaigns, visual merchandising, and brand identity.",
    badge: "Marketing",
    accent: "#c084fc",
  },
];

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
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <p style={{ color: "#cbd5e1" }}>Verifying admin session...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "28px 20px 56px",
      }}
    >
      {/* Top Glass Header Bar */}
      <header
        className="glass-card"
        style={{
          padding: "22px 26px",
          marginBottom: "28px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#6ee7b7",
              fontWeight: 600,
            }}
          >
            Supermarket StaffApp • Admin Command
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: 700, marginTop: "4px" }}>
            Welcome Admin
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px" }}>
            Select an active department below to manage workflows and staff operations.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            {DEPARTMENTS.length} Departments Active
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

      {/* Responsive Flex Wrap of Glassmorphism Department Cards */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {DEPARTMENTS.map((dept) => (
          <article
            key={dept.id}
            className="glass-card dept-card"
            style={{
              flex: "1 1 300px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
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
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                  {dept.code}
                </span>
              </div>

              <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#f8fafc" }}>
                {dept.name}
              </h2>
              <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "#cbd5e1" }}>
                {dept.description}
              </p>
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
              <span style={{ color: "#6ee7b7", fontWeight: 500 }}>● Active</span>
              <span style={{ color: dept.accent, fontWeight: 600 }}>Open Module →</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
