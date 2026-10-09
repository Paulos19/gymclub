import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden bg-white text-[#1E2022] font-sans selection:bg-[#D2FB4C] selection:text-[#1E2022]">
      {children}
    </div>
  );
}
