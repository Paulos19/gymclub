import React from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F6F2] text-[#1E2022] px-3 sm:px-6 md:px-8 py-4 pb-16 selection:bg-[#D2FB4C] selection:text-[#1E2022]">
      {/* Ambient warm radial glow in top right corner (Crextio aesthetic) */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[550px] h-[450px] -z-0 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(210, 251, 76, 0.18) 35%, transparent 70%)",
        }}
      />

      {/* Top Navbar */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-[1440px] mx-auto">
        {children}
      </main>
    </div>
  );
}

