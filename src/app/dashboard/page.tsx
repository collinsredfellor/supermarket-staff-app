"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("staffapp_admin_auth");
    if (!raw) {
      router.replace("/");
      return;
    }
    setAuthorized(true);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("staffapp_admin_auth");
    router.push("/");
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="w-full border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-slate-900"
            aria-label="Supermarket Cart Logo"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Supermarket StaffApp</span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition cursor-pointer"
        >
          Logout
        </button>
      </header>

      <section className="flex-1 flex items-center justify-center p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome Admin
        </h1>
      </section>
    </main>
  );
}
