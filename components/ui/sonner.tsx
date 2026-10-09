"use client";

import { Toaster as RadixToaster } from "sonner";

export function Toaster() {
  return (
    <RadixToaster
      position="top-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: "#1E2022",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          fontFamily: "var(--font-sans), sans-serif",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
        },
        className: "gymclub-toast",
      }}
    />
  );
}

export { toast } from "sonner";
