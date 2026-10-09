"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Sparkles, Calendar, Bell, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const { data: session } = useSession();
  const { toggleMobileSidebar } = useSidebar();

  const athleteName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : "Atleta";

  // Formata a data atual em português
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      style={{
        height: 68,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(10, 15, 26, 0.8)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(14px, 2.5vw, 28px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Lado Esquerdo: Botão Hamburger (Mobile) + Boas-Vindas */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Botão Hamburger Retrátil para Mobile/Tablet */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Abrir Menu Lateral"
          className="sidebar-mobile-toggle"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all var(--trans-fast)",
          }}
        >
          <Menu size={20} strokeWidth={2.4} />
        </button>

        <div>
          <h1
            style={{
              fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: 0,
            }}
          >
            Olá, {athleteName}! ⚡
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.76rem",
              color: "var(--text-dim)",
              marginTop: 2,
            }}
          >
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas (Coach IA, Novo Treino, Notificações) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/ai-coach"
          className="btn-cyan"
          style={{
            padding: "8px 14px",
            fontSize: "0.82rem",
            gap: 6,
            borderRadius: 8,
          }}
        >
          <Sparkles size={15} />
          <span className="hide-on-mobile-xs">Coach IA</span>
        </Link>

        <Link
          href="/workouts?new=true"
          className="btn-primary"
          style={{
            padding: "8px 14px",
            fontSize: "0.82rem",
            gap: 6,
            borderRadius: 8,
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hide-on-mobile-xs">Novo Treino</span>
        </Link>

        <div
          title="Notificações"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Bell size={16} />
        </div>
      </div>
    </header>
  );
}
