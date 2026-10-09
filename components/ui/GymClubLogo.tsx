"use client";

import React from "react";
import Link from "next/link";

export interface GymClubLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "minimal" | "tab";
  className?: string;
}

export default function GymClubLogo({
  href = "/",
  size = "md",
  variant = "light",
  className = "",
}: GymClubLogoProps) {
  const isDark = variant === "dark" || variant === "tab";
  const isMinimal = variant === "minimal";

  const sizeStyles = {
    sm: {
      padding: "5px 14px",
      fontSize: "0.82rem",
      dotSize: 8,
      gap: 7,
    },
    md: {
      padding: "8px 20px",
      fontSize: "0.94rem",
      dotSize: 10,
      gap: 9,
    },
    lg: {
      padding: "10px 24px",
      fontSize: "1.15rem",
      dotSize: 11,
      gap: 10,
    },
  }[size];

  const pillContent = (
    <div
      className={`gymclub-brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizeStyles.gap,
        padding: isMinimal ? "0" : sizeStyles.padding,
        borderRadius: 9999,
        backgroundColor: isMinimal
          ? "transparent"
          : isDark
          ? "#1E2022"
          : "rgba(255, 255, 255, 0.95)",
        color: isDark ? "#FFFFFF" : "#1E2022",
        border: isMinimal
          ? "none"
          : isDark
          ? "1.5px solid rgba(255, 255, 255, 0.12)"
          : "1.5px solid rgba(0, 0, 0, 0.1)",
        boxShadow: isMinimal
          ? "none"
          : isDark
          ? "0 4px 16px rgba(0, 0, 0, 0.35)"
          : "0 2px 10px rgba(0, 0, 0, 0.05)",
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        userSelect: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        if (!isMinimal) {
          e.currentTarget.style.borderColor = "#D2FB4C";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        if (!isMinimal) {
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(0, 0, 0, 0.1)";
        }
      }}
    >
      {/* Ponto de Status Fluorescente Verde-Limão (#D2FB4C) Oficial */}
      <span
        style={{
          width: sizeStyles.dotSize,
          height: sizeStyles.dotSize,
          borderRadius: "50%",
          backgroundColor: "#D2FB4C",
          boxShadow: "0 0 10px rgba(210, 251, 76, 0.8)",
          flexShrink: 0,
          display: "inline-block",
        }}
      />

      {/* Tipografia Oficial da Marca GymClub */}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 800,
          fontSize: sizeStyles.fontSize,
          letterSpacing: "-0.4px",
          lineHeight: 1,
        }}
      >
        GymClub
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {pillContent}
      </Link>
    );
  }

  return pillContent;
}
