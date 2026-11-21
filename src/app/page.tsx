"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("ADMIN-001");
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState("");

  function handleAdminLogin(e: FormEvent) {
    e.preventDefault();
    if (!adminId.trim() || !pin.trim()) {
      setError("Please enter your Admin ID and PIN.");
      return;
    }

    localStorage.setItem(
      "staffapp_admin_auth",
      JSON.stringify({
        user: "Admin",
        adminId: adminId.trim().toUpperCase(),
        loggedInAt: new Date().toISOString(),
      })
    );

    router.push("/dashboard");
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
          <h1 className="text-xl font-bold tracking-tight">Supermarket StaffApp</h1>
        </div>
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          Admin Login
        </span>
      </header>

      <section className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-slate-200 rounded-2xl p-8 bg-white shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl border border-slate-200 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-slate-900"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Admin Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to open the Admin Dashboard.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PIN / Passcode
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Log In as Admin
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
