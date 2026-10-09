import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GymCoach IA • Treinador Virtual & Biomecânica de Elite",
  description:
    "Converse com o GymCoach IA para planejar rotinas de treino, analisar sobrecarga progressiva, calcular macronutrientes e tirar dúvidas de biomecânica.",
};

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#131314] text-[#E3E3E3] selection:bg-[#D2FB4C] selection:text-[#1E2022] font-sans">
      {/* Background ambient lighting sutil para profundidade */}
      <div
        className="pointer-events-none fixed -top-40 -right-40 w-[600px] h-[600px] -z-0 opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(210, 251, 76, 0.4) 0%, rgba(56, 189, 248, 0.2) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -left-40 w-[600px] h-[600px] -z-0 opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(134, 140, 240, 0.3) 0%, rgba(210, 251, 76, 0.1) 40%, transparent 70%)",
        }}
      />

      {children}
    </div>
  );
}
