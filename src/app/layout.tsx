import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supermarket StaffApp",
  description: "Admin & Staff Management Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
