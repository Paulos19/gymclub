"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Camera,
  Sparkles,
  User,
  LogOut,
  Flame,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import GymClubLogo from "@/components/ui/GymClubLogo";

const NAV_ITEMS = [
  { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meus Treinos", href: "/workouts", icon: Dumbbell },
  { label: "Evolução de Cargas", href: "/evolution", icon: TrendingUp },
  { label: "Fotos de Progresso", href: "/photos", icon: Camera },
  { label: "Treinador IA", href: "/ai-coach", icon: Sparkles, badge: "IA" },
  { label: "Meu Perfil", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    isMobileOpen,
    closeMobileSidebar,
    isDesktopCollapsed,
    toggleDesktopCollapse,
  } = useSidebar();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "A";

  const panelWidth = isDesktopCollapsed ? 82 : 270;

  return (
    <div
      className={`sidebar-container ${isMobileOpen ? "open" : ""}`}
      onClick={closeMobileSidebar}
    >
      <aside
        className="sidebar-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: panelWidth,
          background: "rgba(10, 15, 26, 0.98)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isDesktopCollapsed ? "20px 10px" : "20px 16px",
          height: "100vh",
          boxSizing: "border-box",
          overflowY: "auto",
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div>
          {/* Header do Sidebar: Logo e Botões de Fechar / Recolher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isDesktopCollapsed ? "center" : "space-between",
              marginBottom: 24,
              padding: "4px 6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {isDesktopCollapsed ? (
                <Link
                  href="/dashboard"
                  onClick={closeMobileSidebar}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#1E2022",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                  title="GymClub"
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#D2FB4C",
                      boxShadow: "0 0 10px rgba(210, 251, 76, 0.8)",
                    }}
                  />
                </Link>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <GymClubLogo href="/dashboard" variant="dark" size="sm" />
                  <span
                    className="badge badge-amber"
                    style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                  >
                    PRO
                  </span>
                </div>
              )}
            </div>

            {/* Botão de Fechar no Mobile */}
            <button
              onClick={closeMobileSidebar}
              className="sidebar-mobile-close-btn"
              title="Fechar Menu"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--border-medium)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  title={isDesktopCollapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isDesktopCollapsed ? "center" : "flex-start",
                    gap: 12,
                    padding: isDesktopCollapsed ? "12px" : "12px 14px",
                    borderRadius: 10,
                    fontSize: "0.92rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#000" : "var(--text-muted)",
                    background: isActive ? "var(--amber-gradient)" : "transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(245, 158, 11, 0.3)" : "none",
                    transition: "all var(--trans-fast)",
                  }}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                  {!isDesktopCollapsed && (
                    <>
                      <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                      {item.badge && !isActive && (
                        <span
                          className="badge badge-cyan"
                          style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé do Sidebar: Botão de Recolher (Desktop) + Usuário & Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {/* Botão de Recolher no Desktop */}
          <button
            onClick={toggleDesktopCollapse}
            className="sidebar-desktop-collapse-btn"
            title={isDesktopCollapsed ? "Expandir Menu" : "Recolher Menu"}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: isDesktopCollapsed ? "center" : "space-between",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              transition: "all var(--trans-fast)",
            }}
          >
            {!isDesktopCollapsed && <span>Recolher Menu</span>}
            {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Card Motivacional (apenas quando expandido) */}
          {!isDesktopCollapsed && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.06)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--amber-light)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                <Flame size={14} />
                FOCO & DISCIPLINA
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                &quot;A carga que você não tenta levantar é a única que você nunca supera.&quot;
              </p>
            </div>
          )}

          {/* Card de Usuário & Botão Sair */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: isDesktopCollapsed ? "10px" : "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: isDesktopCollapsed ? "center" : "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                overflow: "hidden",
                justifyContent: isDesktopCollapsed ? "center" : "flex-start",
                width: isDesktopCollapsed ? "100%" : "auto",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--amber-primary)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>

              {!isDesktopCollapsed && (
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#fff",
                    }}
                  >
                    {session?.user?.name || "Atleta"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.74rem",
                      color: "var(--text-dim)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <CheckCircle2 size={12} color="var(--emerald-light)" />
                    Ativo
                  </div>
                </div>
              )}
            </div>

            {!isDesktopCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sair da conta"
                className="btn-icon"
                style={{ padding: 6, color: "var(--text-dim)" }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
