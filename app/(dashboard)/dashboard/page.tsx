"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Watch,
  Activity,
  Dumbbell,
  Flame,
  Target,
  Sparkles,
  Calendar as CalendarIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Smartphone,
  Award,
  Zap,
  LogOut,
} from "lucide-react";
import ThreePlateCard from "@/components/dashboard/ThreePlateCard";
import WeatherAiCard from "@/components/dashboard/WeatherAiCard";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  targetGoal: string | null;
  currentWeight: number | null;
  height: number | null;
  _count?: {
    workouts: number;
    workoutLogs: number;
    progressPhotos: number;
  };
}

interface ChecklistItem {
  id: string;
  name: string;
  detail: string;
  completed: boolean;
}

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  // Estados de dados reais
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [totalWorkoutsCount, setTotalWorkoutsCount] = useState<number>(0);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modais adicionais (3D Plate e Clima IA)
  const [showThreePlate, setShowThreePlate] = useState(false);
  const [showWeatherAi, setShowWeatherAi] = useState(false);

  // Estado do Accordion da Coluna 1
  const [accordionOpen, setAccordionOpen] = useState<{ [key: string]: boolean }>({
    biometrics: false,
    devices: true,
    division: false,
    benefits: false,
  });

  // Estado do Gráfico Semanal (Coluna 2 - Top)
  const [activeDayIdx, setActiveDayIdx] = useState<number>(5); // Sexta selecionada por padrão
  const weekDays = [
    { label: "D", hours: "0.5h", heightPct: 20, name: "Domingo" },
    { label: "S", hours: "1.4h", heightPct: 65, name: "Segunda" },
    { label: "T", hours: "1.2h", heightPct: 50, name: "Terça" },
    { label: "Q", hours: "1.6h", heightPct: 75, name: "Quarta" },
    { label: "Q", hours: "1.8h", heightPct: 90, name: "Quinta" },
    { label: "S", hours: "1.1h", heightPct: 60, name: "Sexta", badge: "5h 25m" },
    { label: "S", hours: "0.0h", heightPct: 15, name: "Sábado" },
  ];

  // Estado do Time Tracker (Coluna 3 - Top)
  const [timerSeconds, setTimerSeconds] = useState(155); // 02:35 padrão
  const [timerRunning, setTimerRunning] = useState(false);

  // Efeito do Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Estado da Agenda Semanal (Coluna 2 - Bottom)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(24);
  const calendarDays = [
    { day: "Seg", date: 22 },
    { day: "Ter", date: 23 },
    { day: "Qua", date: 24, isToday: true },
    { day: "Qui", date: 25 },
    { day: "Sex", date: 26 },
    { day: "Sáb", date: 27 },
  ];

  // Estado da Checklist de Treino de Hoje (Coluna 4)
  const [tasks, setTasks] = useState<ChecklistItem[]>([
    { id: "1", name: "Supino Reto com Barra", detail: "4x8-12 • 60kg", completed: true },
    { id: "2", name: "Supino Inclinado Halteres", detail: "4x10 • 32kg", completed: true },
    { id: "3", name: "Crucifixo com Halteres", detail: "3x12 • 24kg", completed: false },
    { id: "4", name: "Desenvolvimento Militar", detail: "4x8 • 28kg", completed: false },
    { id: "5", name: "Tríceps Polia Corda", detail: "4x12 • 35kg", completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const taskProgressPct = Math.round((completedCount / tasks.length) * 100);

  // Carregar dados reais do usuário
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, workoutsRes, logsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/workouts"),
          fetch("/api/logs"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData?.user) setProfile(profileData.user);
        }

        if (workoutsRes.ok) {
          const workoutsData = await workoutsRes.json();
          const list = Array.isArray(workoutsData)
            ? workoutsData
            : workoutsData.workouts || [];
          setTotalWorkoutsCount(list.length);

          if (list.length > 0 && list[0]?.exercises?.length > 0) {
            const dynamicTasks = list[0].exercises
              .slice(0, 5)
              .map((ex: any, idx: number) => ({
                id: ex.id || String(idx),
                name: ex.name,
                detail: `${ex.sets || 4}x${ex.reps || "10"} • ${ex.weight || 20}kg`,
                completed: idx < 2,
              }));
            setTasks(dynamicTasks);
          }
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          const list = Array.isArray(logsData) ? logsData : logsData.logs || [];
          setTotalLogsCount(list.length);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session?.user?.id]);

  const athleteName = profile?.name || session?.user?.name || "Henrique";
  const athleteFirstName = athleteName.split(" ")[0];
  const userPhoto =
    profile?.image ||
    session?.user?.image ||
    "/assets/busto.png";

  const athleteGoal = profile?.targetGoal || "Hipertrofia";
  const athleteWeight = profile?.currentWeight ? `${profile.currentWeight} kg` : "84 kg";
  const athleteHeight = profile?.height ? `${profile.height} cm` : "178 cm";

  const imcCalc =
    profile?.currentWeight && profile?.height
      ? (profile.currentWeight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : "26.5";

  const kpiExercises = totalWorkoutsCount > 0 ? totalWorkoutsCount * 6 : 6;
  const kpiSets = totalLogsCount > 0 ? totalLogsCount * 12 : 12;
  const kpiReps = totalLogsCount > 0 ? totalLogsCount * 95 : 95;

  return (
    <div className="w-full flex flex-col gap-6 text-[#1E2022] pb-10">
      {/* ========================================================
          1. SUB-HEADER: SAUDAÇÃO & MULTI-SEGMENTO DE METAS (Estilo Crextio)
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        {/* Lado Esquerdo: Título & Barra Multi-Segmento */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2022] font-sans">
            Welcome in, {athleteFirstName}
          </h1>

          {/* Barra Multi-Segmentada com Tags Superiores Fitness */}
          <div className="flex flex-col gap-1.5 max-w-xl">
            {/* Rótulos Superiores com Percentuais */}
            <div className="flex items-center gap-6 text-[11px] font-bold text-[#64748B]">
              <span>Hipertrofia <strong className="text-[#1E2022]">60%</strong></span>
              <span>Cargas <strong className="text-[#1E2022]">20%</strong></span>
              <span>Cardio <strong className="text-[#1E2022]">10%</strong></span>
              <span>Recuperação <strong className="text-[#1E2022]">10%</strong></span>
            </div>

            {/* Pílulas da Barra Multi-Segmento */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Segmento 1: Dark Pill */}
              <div className="px-3.5 py-1.5 rounded-full bg-[#1E2022] text-white text-[11px] font-extrabold shadow-xs">
                60%
              </div>

              {/* Segmento 2: Accent Pill (Verde-Limão Fluorescente Oficial #D2FB4C) */}
              <div className="px-3.5 py-1.5 rounded-full bg-[#D2FB4C] text-[#1E2022] text-[11px] font-black shadow-xs">
                20%
              </div>

              {/* Segmento 3: Hatched Striped Pill */}
              <div className="flex-1 min-w-[130px] px-4 py-1.5 rounded-full border border-black/10 text-[11px] font-extrabold text-[#1E2022] flex items-center justify-center shadow-xs bg-striped-capsule">
                10%
              </div>


              {/* Segmento 4: Outlined Pill */}
              <div className="px-3.5 py-1.5 rounded-full border border-black/15 bg-white/70 text-[#64748B] text-[11px] font-bold shadow-xs">
                10%
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Três Contadores KPI de Alto Impacto em Card Branco */}
        <div className="flex items-center gap-6 sm:gap-8 bg-white/80 backdrop-blur-md px-6 py-3.5 rounded-3xl border border-black/10 shadow-xs w-fit">
          {/* KPI 1: Exercícios */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1E2022] tracking-tight">
              {kpiExercises}
            </div>
            <div className="text-[11px] leading-tight text-[#64748B] font-bold">
              <span className="block text-[#1E2022]">🏋️</span>
              Exercícios
            </div>
          </div>

          <div className="w-[1.5px] h-8 bg-black/10" />

          {/* KPI 2: Séries */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1E2022] tracking-tight">
              {kpiSets}
            </div>
            <div className="text-[11px] leading-tight text-[#64748B] font-bold">
              <span className="block text-[#1E2022]">⚡</span>
              Séries
            </div>
          </div>

          <div className="w-[1.5px] h-8 bg-black/10" />

          {/* KPI 3: Reps Totais */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1E2022] tracking-tight">
              {kpiReps}
            </div>
            <div className="text-[11px] leading-tight text-[#64748B] font-bold">
              <span className="block text-[#1E2022]">🎯</span>
              Reps
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. GRADE BENTO PRINCIPAL (CREXTIO 4-PILLAR ARCHITECTURE)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================
            COLUNA 1: CARD DO USUÁRIO + ACCORDION (lg:col-span-3)
            ====================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* CARD A: FOTO DO USUÁRIO COM GLASSMORPHISM & BLUR INFERIOR */}
          <div className="relative h-[320px] rounded-[28px] overflow-hidden border border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white group">
            <Image
              src={
                photoError || !userPhoto
                  ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  : userPhoto
              }
              alt={athleteName}
              fill
              priority
              unoptimized
              onError={() => setPhotoError(true)}
              sizes="320px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradiente de sombreamento suave */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Painel Glassmorphism com Blur Inferior */}
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl p-3.5 backdrop-blur-xl bg-black/40 border border-white/20 text-white flex items-center justify-between shadow-lg">
              <div>
                <h3 className="font-extrabold text-[0.95rem] tracking-tight text-white leading-tight">
                  {athleteName}
                </h3>
                <p className="text-[11px] text-white/80 font-medium mt-0.5">
                  {profile?.bio || `Foco em ${athleteGoal.toLowerCase()}`}
                </p>
              </div>

              {/* Pílula de Peso em Verde-Limão Fluorescente #D2FB4C */}
              <div className="px-3 py-1.5 rounded-full bg-[#D2FB4C] text-[#1E2022] text-[11px] font-black shadow-xs whitespace-nowrap">
                {athleteWeight}
              </div>
            </div>
          </div>

          {/* CARD B: ACCORDION INTERATIVO (Biometria, Dispositivos, Divisão) */}
          <div className="rounded-[28px] bg-white border border-black/10 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-3.5">
            {/* Item 1: Biometria & Metas */}
            <div className="border-b border-black/5 pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, biometrics: !p.biometrics }))
                }
                className="w-full flex items-center justify-between text-xs font-bold text-[#1E2022] hover:text-black transition-colors"
              >
                <span>Biometria & Metas</span>
                {accordionOpen.biometrics ? (
                  <ChevronUp size={15} className="text-[#64748B]" />
                ) : (
                  <ChevronDown size={15} className="text-[#64748B]" />
                )}
              </button>
              {accordionOpen.biometrics && (
                <div className="mt-2 text-[11px] text-[#64748B] flex flex-col gap-1 animate-in fade-in duration-150">
                  <div className="flex justify-between">
                    <span>Peso Atual:</span>
                    <strong className="text-[#1E2022]">{athleteWeight}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Altura:</span>
                    <strong className="text-[#1E2022]">{athleteHeight}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>IMC Estimado:</span>
                    <strong className="text-[#1E2022]">{imcCalc}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Item 2: Dispositivos & Sensores */}
            <div className="border-b border-black/5 pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, devices: !p.devices }))
                }
                className="w-full flex items-center justify-between text-xs font-bold text-[#1E2022] hover:text-black transition-colors"
              >
                <span>Dispositivos</span>
                {accordionOpen.devices ? (
                  <ChevronUp size={15} className="text-[#64748B]" />
                ) : (
                  <ChevronDown size={15} className="text-[#64748B]" />
                )}
              </button>

              {accordionOpen.devices && (
                <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-[#F8F9FA] border border-black/5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#1E2022]">
                      <Watch size={17} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#1E2022]">
                        Apple Watch Ultra
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Monitor Cardíaco • Conectado
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[#64748B] hover:text-[#1E2022] p-1"
                    title="Mais opções"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Item 3: Divisão de Treinos */}
            <div className="border-b border-black/5 pb-3">
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, division: !p.division }))
                }
                className="w-full flex items-center justify-between text-xs font-bold text-[#1E2022] hover:text-black transition-colors"
              >
                <span>Divisão de Treinos</span>
                {accordionOpen.division ? (
                  <ChevronUp size={15} className="text-[#64748B]" />
                ) : (
                  <ChevronDown size={15} className="text-[#64748B]" />
                )}
              </button>
              {accordionOpen.division && (
                <div className="mt-2 text-[11px] text-[#64748B] flex flex-col gap-1">
                  <span>Rotina Ativa: <strong>ABCDE Hipertrofia</strong></span>
                  <span>Frequência: <strong>5x por semana</strong></span>
                </div>
              )}
            </div>

            {/* Item 4: Assinatura & Benefícios */}
            <div>
              <button
                type="button"
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, benefits: !p.benefits }))
                }
                className="w-full flex items-center justify-between text-xs font-bold text-[#1E2022] hover:text-black transition-colors"
              >
                <span>Membro GymClub</span>
                {accordionOpen.benefits ? (
                  <ChevronUp size={15} className="text-[#64748B]" />
                ) : (
                  <ChevronDown size={15} className="text-[#64748B]" />
                )}
              </button>
              {accordionOpen.benefits && (
                <div className="mt-2 text-[11px] text-[#64748B] flex flex-col gap-1">
                  <span className="text-emerald-700 font-bold">● Acesso Total Black</span>
                  <span>Consultoria IA & Backup Cloud</span>
                </div>
              )}
            </div>
          </div>

          {/* CARD C: SESSÃO DO USUÁRIO & LOGOUT */}
          <div className="rounded-[24px] bg-white border border-black/10 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <LogOut size={15} />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#1E2022] truncate">Sessão Ativa</div>
                <div className="text-[10px] text-[#64748B] truncate">{profile?.email || session?.user?.email || "Conectado"}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Encerrar sessão"
            >
              Sair
            </button>
          </div>
        </div>

        {/* ======================================================
            COLUNA DO MEIO: PROGRESS + TIME TRACKER + CALENDÁRIO (lg:col-span-6)
            ====================================================== */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* LINHA SUPERIOR: PROGRESSO SEMANAL & TIME TRACKER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --------------------------------------------------
                CARD C: PROGRESS (Weekly Bar Chart Crextio)
                -------------------------------------------------- */}
            <div className="rounded-[28px] bg-white border border-black/10 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[300px]">
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#64748B]">Progress</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#1E2022] tracking-tight">
                      6.1 h
                    </span>
                    <span className="text-[11px] text-[#64748B] font-semibold">
                      Work Time<br />this week
                    </span>
                  </div>
                </div>

                <Link
                  href="/evolution"
                  className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-[#1E2022] hover:bg-black/5 transition-colors"
                  title="Ver evolução completa"
                >
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Gráfico de Barras Verticais com Destaque Neon #D2FB4C */}
              <div className="pt-6 relative">
                <div className="flex items-end justify-between gap-2 h-32 px-1">
                  {weekDays.map((d, idx) => {
                    const isSelected = activeDayIdx === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveDayIdx(idx)}
                        className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        {/* Tooltip Único Sem Sobreposição */}
                        <div className="h-6 flex items-center justify-center">
                          {isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#D2FB4C] text-[#1E2022] text-[10px] font-black shadow-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                              {d.badge || d.hours}
                            </span>
                          )}
                        </div>

                        {/* Barra Vertical */}
                        <div className="w-full flex justify-center h-20 items-end">
                          <div
                            style={{ height: `${d.heightPct}%` }}
                            className={`w-3.5 rounded-full transition-all duration-300 ${
                              isSelected
                                ? "bg-[#D2FB4C] ring-2 ring-[#D2FB4C]/40"
                                : "bg-[#1E2022] group-hover:bg-[#1E2022]/80"
                            }`}
                          />
                        </div>

                        {/* Rótulo do Dia (S M T W T F S) */}
                        <span
                          className={`text-[11px] font-bold ${
                            isSelected ? "text-[#1E2022]" : "text-[#8E9398]"
                          }`}
                        >
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------
                CARD D: TIME TRACKER (Cronômetro Circular Crextio)
                -------------------------------------------------- */}
            <div className="rounded-[28px] bg-white border border-black/10 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[300px]">
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#64748B]">Time tracker</h4>
                </div>

                <Link
                  href="/workouts"
                  className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-[#1E2022] hover:bg-black/5 transition-colors"
                  title="Treinos"
                >
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Dial Circular com SVG e Tempo Digital Central */}
              <div className="flex flex-col items-center justify-center my-auto py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="5"
                      strokeDasharray="2 4"
                    />
                    {/* Arco de progresso ativo em Verde-Limão #D2FB4C */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#D2FB4C"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - timerSeconds / 180)}
                      className="transition-all duration-300"
                    />
                  </svg>

                  {/* Leitura Digital Central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-[#1E2022] tracking-tight">
                      {formatTimer(timerSeconds)}
                    </span>
                    <span className="text-[10px] text-[#8E9398] font-bold">
                      Work Time
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles Interativos Inferiores (Play, Pause, Reset) */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning(true)}
                  className={`w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#1E2022] hover:bg-black/5 transition-all ${
                    timerRunning ? "bg-[#D2FB4C]" : "bg-white shadow-xs"
                  }`}
                  title="Iniciar"
                >
                  <Play size={14} className="fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() => setTimerRunning(false)}
                  className={`w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-[#1E2022] hover:bg-black/5 transition-all ${
                    !timerRunning && timerSeconds < 155 ? "bg-black/5" : "bg-white shadow-xs"
                  }`}
                  title="Pausar"
                >
                  <Pause size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(155);
                  }}
                  className="w-9 h-9 rounded-full bg-[#1E2022] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all"
                  title="Reiniciar Descanso"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              CARD E: AGENDA SEMANAL / TIMELINE (Sem Colisão de Horário)
              ---------------------------------------------------- */}
          <div className="rounded-[28px] bg-white border border-black/10 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-5">
            {/* Header com Navegação de Mês */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E9398]">Agosto</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#1E2022]">
                  Outubro 2026
                </span>
              </div>
              <span className="text-xs font-bold text-[#8E9398]">Novembro</span>
            </div>

            {/* Colunas dos Dias da Semana */}
            <div className="grid grid-cols-6 gap-2 border-b border-black/5 pb-4">
              {calendarDays.map((d) => {
                const isSelected = selectedCalendarDay === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedCalendarDay(d.date)}
                    className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#1E2022] text-white font-black"
                        : "text-[#64748B] hover:bg-black/5"
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{d.day}</span>
                    <span className="text-sm font-black">{d.date}</span>
                  </button>
                );
              })}
            </div>

            {/* Linhas de Horário & Cards com Espaçamento Fixo sem Sobreposição */}
            <div className="flex flex-col gap-3.5 relative py-1">
              {/* Linha 8:00 am com Card Preto */}
              <div className="flex items-center gap-3">
                <span className="w-16 flex-shrink-0 text-right pr-2 text-[11px] font-bold text-[#8E9398]">
                  8.00 am
                </span>
                <div className="flex-1 flex items-center">
                  <div className="w-full px-4 py-2.5 rounded-2xl bg-[#1E2022] text-white shadow-sm flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform cursor-pointer">
                    <div>
                      <div className="text-xs font-bold">Treino A - Peitoral & Tríceps</div>
                      <div className="text-[10px] text-zinc-400">
                        Sobrecarga progressiva no Supino
                      </div>
                    </div>
                    {/* Avatares Pequenos */}
                    <div className="flex -space-x-1.5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full ring-2 ring-[#1E2022] bg-[#D2FB4C] text-[9px] font-bold text-[#1E2022] flex items-center justify-center">
                        GC
                      </div>
                      <div className="w-5 h-5 rounded-full ring-2 ring-[#1E2022] bg-[#CADBD0] text-[9px] font-bold text-[#1E2022] flex items-center justify-center">
                        IA
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 9:00 am vazia */}
              <div className="flex items-center gap-3">
                <span className="w-16 flex-shrink-0 text-right pr-2 text-[11px] font-bold text-[#8E9398]">
                  9.00 am
                </span>
                <div className="flex-1 h-[1px] bg-black/5" />
              </div>

              {/* Linha 10:00 am com Card Branco */}
              <div className="flex items-center gap-3">
                <span className="w-16 flex-shrink-0 text-right pr-2 text-[11px] font-bold text-[#8E9398]">
                  10.00 am
                </span>
                <div className="flex-1 flex items-center">
                  <div className="w-full px-4 py-2 rounded-2xl bg-white border border-black/10 shadow-xs flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-[#1E2022]">
                        Sessão de Cardio & Mobilidade
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        30 min esteira inclinado + core
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D2FB4C]/30 text-[#1E2022]">
                      Leve
                    </span>
                  </div>
                </div>
              </div>

              {/* Linha 11:00 am */}
              <div className="flex items-center gap-3">
                <span className="w-16 flex-shrink-0 text-right pr-2 text-[11px] font-bold text-[#8E9398]">
                  11.00 am
                </span>
                <div className="flex-1 h-[1px] bg-black/5" />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            COLUNA 4: ONBOARDING & DARK CHECKLIST ISLAND (lg:col-span-3)
            ====================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="rounded-[28px] bg-white border border-black/10 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-5">
            {/* Topo do Card: Progresso de Meta Semanal */}
            <div>
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-bold text-[#64748B]">Onboarding</h4>
                <span className="text-2xl font-black text-[#1E2022] tracking-tight">
                  {taskProgressPct}%
                </span>
              </div>

              {/* Barra Tri-Segmentada com Verde-Limão #D2FB4C */}
              <div className="flex items-center gap-1.5 mt-3">
                <div className="px-3 py-1 rounded-full bg-[#D2FB4C] text-[#1E2022] text-[10px] font-black flex-1 text-center shadow-xs">
                  Treino {taskProgressPct}%
                </div>
                <div className="px-3 py-1 rounded-full bg-[#1E2022] text-white text-[10px] font-bold flex-1 text-center shadow-xs">
                  Carga 25%
                </div>
                <div className="px-2 py-1 rounded-full bg-[#E5E7EB] text-[#64748B] text-[10px] font-bold text-center">
                  0%
                </div>
              </div>
            </div>

            {/* ILHA ESCURA (CARD PRETO CREXTIO): ONBOARDING TASK */}
            <div className="rounded-[24px] bg-[#1E2022] text-white p-5 shadow-lg flex flex-col gap-4">
              {/* Header da Ilha */}
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <h5 className="text-xs font-extrabold text-white">
                  Onboarding Task
                </h5>
                <span className="text-sm font-black text-white tracking-tight">
                  {completedCount}/{tasks.length}
                </span>
              </div>

              {/* Lista Interativa de Tarefas com Checkbox Circular #D2FB4C */}
              <div className="flex flex-col gap-3">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                        {idx === 0 ? (
                          <Dumbbell size={14} />
                        ) : idx === 1 ? (
                          <Zap size={14} />
                        ) : idx === 2 ? (
                          <Target size={14} />
                        ) : idx === 3 ? (
                          <Flame size={14} />
                        ) : (
                          <Award size={14} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate transition-colors ${
                            task.completed
                              ? "text-zinc-400 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {task.detail}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox Circular Verde-Limão #D2FB4C */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed
                          ? "bg-[#D2FB4C] text-[#1E2022]"
                          : "border border-white/30 text-transparent group-hover:border-white/60"
                      }`}
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BÔNUS: BOTÕES DE ACESSO RÁPIDO PARA ANILHA 3D E CLIMA IA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowThreePlate(!showThreePlate)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white border border-black/10 text-xs font-bold text-[#1E2022] hover:bg-black/5 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles size={14} className="text-[#868CF0]" />
              <span>Anilha 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWeatherAi(!showWeatherAi)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white border border-black/10 text-xs font-bold text-[#1E2022] hover:bg-black/5 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Activity size={14} className="text-[#D2FB4C]" />
              <span>Clima & IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEÇÕES COLAPSÁVEIS OPCIONAIS: THREE.JS & CLIMA IA
          ======================================================== */}
      {showThreePlate && (
        <div className="mt-4 p-6 rounded-3xl bg-white border border-black/10 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-[#1E2022]">
              Simulador Olímpico 3D & 1RM
            </h3>
            <button
              onClick={() => setShowThreePlate(false)}
              className="text-xs font-bold text-[#64748B] hover:text-[#1E2022]"
            >
              Fechar
            </button>
          </div>
          <ThreePlateCard />
        </div>
      )}

      {showWeatherAi && (
        <div className="mt-4 p-6 rounded-3xl bg-white border border-black/10 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-[#1E2022]">
              Relatório Meteorológico & IA
            </h3>
            <button
              onClick={() => setShowWeatherAi(false)}
              className="text-xs font-bold text-[#64748B] hover:text-[#1E2022]"
            >
              Fechar
            </button>
          </div>
          <WeatherAiCard />
        </div>
      )}
    </div>
  );
}
