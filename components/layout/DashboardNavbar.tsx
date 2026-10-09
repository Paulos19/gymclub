"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Settings,
  Menu,
  X,
  CloudSun,
  Dumbbell,
  Sparkles,
  Search,
  LogOut,
} from "lucide-react";
import GymClubLogo from "@/components/ui/GymClubLogo";

const DASHBOARD_ROUTES = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Treinos", href: "/workouts" },
  { label: "Evolução", href: "/evolution" },
  { label: "Fotos", href: "/photos" },
  { label: "Coach IA", href: "/ai-coach" },
  { label: "Perfil", href: "/profile" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [latestName, setLatestName] = useState<string | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<{
    temp: number;
    city: string;
    label: string;
  }>({
    temp: 24,
    city: "São Paulo",
    label: "Céu Limpo",
  });

  // Busca dados atualizados do perfil (garante foto real adicionada recentemente)
  useEffect(() => {
    let isMounted = true;
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            if (data.user.image) setLatestImage(data.user.image);
            if (data.user.name) setLatestName(data.user.name);
          }
        }
      } catch {
        // Silencioso
      }
    }
    loadUserProfile();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  // Listener para atualizações climáticas
  useEffect(() => {
    const handleWeatherUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ temp: number; city: string; label: string }>;
      if (customEvent.detail) {
        setWeatherInfo(customEvent.detail);
      }
    };
    window.addEventListener("gymclub:weather-updated", handleWeatherUpdate);
    return () => {
      window.removeEventListener("gymclub:weather-updated", handleWeatherUpdate);
    };
  }, []);

  const userName = latestName || session?.user?.name || "Atleta";
  const userImage = latestImage || session?.user?.image || "/assets/busto.png";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full mb-6 transition-all duration-200">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 px-1 py-1">
        {/* ========================================================
            1. ESQUERDA: PÍLULA DE LOGO DA MARCA (Estilo Crextio)
            ======================================================== */}
        <div className="flex items-center flex-shrink-0">
          <GymClubLogo href="/dashboard" variant="light" size="md" />
        </div>

        {/* ========================================================
            2. CENTRO: DOCK DE NAVEGAÇÃO HORIZONTAL (Estilo Crextio)
            ======================================================== */}
        <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {DASHBOARD_ROUTES.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" && pathname?.startsWith(route.href));

            return (
              <Link
                key={route.href}
                href={route.href}
                style={
                  isActive
                    ? { backgroundColor: "#1E2022", color: "#FFFFFF", fontWeight: 800 }
                    : { color: "#4B5563", fontWeight: 600 }
                }
                className={`px-4 py-1.5 rounded-full text-xs tracking-tight transition-all duration-200 ${isActive
                    ? "shadow-sm"
                    : "hover:text-[#1E2022] hover:bg-black/[0.05]"
                  }`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        {/* ========================================================
            3. DIREITA: CONTROLES, SETTING, NOTIFICAÇÃO & AVATAR
            ======================================================== */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Badge Clima Discreto */}
          <div
            title={`${weatherInfo.temp}°C - ${weatherInfo.label} (${weatherInfo.city})`}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white/80 text-xs font-semibold text-[#1E2022] shadow-xs cursor-default"
          >
            <CloudSun size={14} className="text-[#868CF0]" />
            <span>{weatherInfo.temp}°C</span>
          </div>

          {/* Botão de Configurações / Perfil (Pílula Crextio) */}
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white/90 hover:bg-white text-xs font-bold text-[#1E2022] shadow-xs hover:border-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Settings size={13} className="text-[#64748B]" />
            <span>Setting</span>
          </Link>

          {/* Botão Notificações Circular */}
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-black/10 bg-white/90 hover:bg-white flex items-center justify-center text-[#1E2022] shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 relative"
            title="Notificações"
          >
            <Bell size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#D2FB4C] ring-1 ring-black/15" />
          </button>

          {/* Avatar Circular do Usuário (Foto Real ou Iniciais) */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full border border-black/10 ring-2 ring-white overflow-hidden shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center bg-[#1E2022] text-white flex-shrink-0"
            title={`Perfil de ${userName}`}
          >
            {userImage && !imgError ? (
              <img
                src={userImage}
                alt={userName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-black tracking-tighter">
                {userInitials}
              </span>
            )}
          </Link>

          {/* Botão Sair / Logout */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-black/10 bg-white/90 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-xs font-bold text-[#64748B] shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            title="Encerrar sessão"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Botão Hambúrguer para Telas Pequenas */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden w-9 h-9 rounded-full border border-black/10 bg-white/90 items-center justify-center text-[#1E2022] shadow-xs"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Menu Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {DASHBOARD_ROUTES.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" && pathname?.startsWith(route.href));

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive
                    ? "bg-[#1E2022] text-white"
                    : "text-[#64748B] hover:bg-black/5 hover:text-[#1E2022]"
                  }`}
              >
                {route.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-black/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-[#1E2022]"
              >
                <Settings size={14} />
                <span>Configurações do Perfil</span>
              </Link>
              <span className="text-[11px] text-[#64748B] font-semibold">
                {weatherInfo.temp}°C {weatherInfo.city}
              </span>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer mt-1"
            >
              <LogOut size={14} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
