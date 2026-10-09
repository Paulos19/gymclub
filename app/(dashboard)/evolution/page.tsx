"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Dumbbell,
  Calendar,
  Layers,
  Flame,
  Award,
  Loader2,
  Zap,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Activity,
  Clock,
  Target,
  Trophy,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Play,
} from "lucide-react";

interface ExerciseProgressionLog {
  id: string;
  exerciseName: string;
  maxWeight: number;
  totalVolume: number;
  setsData: string;
  createdAt: string;
  workoutLog: {
    date: string;
    workoutName: string;
  };
}

interface WorkoutLogItem {
  id: string;
  workoutName: string;
  date: string;
  durationMinutes?: number | null;
  perceivedEffort?: number | null;
  exerciseLogs: {
    id: string;
    exerciseName: string;
    maxWeight: number;
    totalVolume: number;
  }[];
}

export default function EvolutionPage() {
  const [logs, setLogs] = useState<WorkoutLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseProgression, setExerciseProgression] = useState<
    ExerciseProgressionLog[]
  >([]);
  const [loadingProgression, setLoadingProgression] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        const logsData = Array.isArray(data?.logs)
          ? data.logs
          : Array.isArray(data)
          ? data
          : [];
        setLogs(logsData);

        // Extrai nomes únicos de exercícios para o seletor
        const exerciseNames = new Set<string>();
        logsData.forEach((l: WorkoutLogItem) => {
          if (Array.isArray(l.exerciseLogs)) {
            l.exerciseLogs.forEach((el) => {
              if (el.exerciseName) exerciseNames.add(el.exerciseName);
            });
          }
        });

        const firstEx = Array.from(exerciseNames)[0];
        if (firstEx) {
          setSelectedExercise(firstEx);
          fetchExerciseProgression(firstEx);
        }
      }
    } catch (err) {
      console.error("Erro ao listar logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgression = async (name: string) => {
    if (!name) return;
    try {
      setLoadingProgression(true);
      const res = await fetch(`/api/logs?exercise=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        const progressionList = Array.isArray(data?.progression)
          ? data.progression
          : Array.isArray(data)
          ? data
          : [];
        setExerciseProgression(progressionList);
      }
    } catch (err) {
      console.error("Erro na progressão do exercício:", err);
    } finally {
      setLoadingProgression(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSelectExercise = (name: string) => {
    setSelectedExercise(name);
    fetchExerciseProgression(name);
  };

  // Coleta lista única de exercícios executados
  const allExerciseNames = Array.from(
    new Set(
      logs
        .flatMap((l) =>
          Array.isArray(l.exerciseLogs)
            ? l.exerciseLogs.map((e) => e.exerciseName)
            : []
        )
        .filter(Boolean)
    )
  );

  // Filtragem de exercícios pelo input de pesquisa
  const filteredExerciseNames = allExerciseNames.filter((name) =>
    name.toLowerCase().includes(exerciseSearch.toLowerCase().trim())
  );

  // Cálculos de métricas globais
  const safeLogs = Array.isArray(logs) ? logs : [];
  const totalSessionsCount = safeLogs.length;

  const totalVolumeTonnage = safeLogs.reduce((acc, log) => {
    const sessionVolume = (log.exerciseLogs || []).reduce(
      (sum, el) => sum + (Number(el.totalVolume) || 0),
      0
    );
    return acc + sessionVolume;
  }, 0);

  const maxSessionVolume = safeLogs.reduce((max, log) => {
    const sessionVolume = (log.exerciseLogs || []).reduce(
      (sum, el) => sum + (Number(el.totalVolume) || 0),
      0
    );
    return sessionVolume > max ? sessionVolume : max;
  }, 0);

  const logsWithDuration = safeLogs.filter((l) => l.durationMinutes && l.durationMinutes > 0);
  const avgSessionDuration =
    logsWithDuration.length > 0
      ? Math.round(
          logsWithDuration.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) /
            logsWithDuration.length
        )
      : 48;

  // Cálculo da carga máxima e inicial do exercício selecionado
  const safeProgression = Array.isArray(exerciseProgression) ? exerciseProgression : [];
  const initialWeight =
    safeProgression.length > 0 ? safeProgression[0].maxWeight : 0;
  const currentMaxWeight =
    safeProgression.length > 0
      ? Math.max(...safeProgression.map((p) => p.maxWeight || 0))
      : 0;
  const weightDifference = currentMaxWeight - initialWeight;
  const growthPercentage =
    initialWeight > 0
      ? Math.round(((currentMaxWeight - initialWeight) / initialWeight) * 100)
      : 0;

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in font-sans">
      {/* ========================================================= */}
      {/* 1. BENTO HEADER MONUMENTAL: PERFORMANCE & CARGAS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* BENTO CARD 1: HERO DA EVOLUÇÃO & VISÃO GLOBAL (8 Colunas) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          {/* Auras de iluminação estilizadas */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D2FB4C]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#868CF0]/10 blur-[80px]" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-[#D2FB4C] shadow-[0_0_8px_#D2FB4C]" />
              SOBRECARGA PROGRESSIVA • ANÁLISE DE PERFORMANCE
            </div>

            <div className="space-y-2">
              <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.05]">
                Evolução de Cargas
              </h1>
              <p className="text-xs sm:text-sm text-[#A4A8AD] max-w-xl font-sans font-medium leading-relaxed">
                Monitore o ganho real de força milissegundo a milissegundo. Cada quilo adicionado à barra fica eternizado para guiar sua hipertrofia.
              </p>
            </div>
          </div>

          {/* Métricas Globais Rápidas no Rodapé do Bento Card */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#8E9296] font-sans">
              <span className="flex items-center gap-2">
                <Activity size={15} className="text-[#D2FB4C]" />
                <strong className="text-white font-bold">{totalSessionsCount}</strong> treinos concluídos
              </span>
              <span className="flex items-center gap-2">
                <Flame size={15} className="text-[#FAB03B]" />
                <strong className="text-white font-bold">
                  {(totalVolumeTonnage / 1000).toFixed(1)} toneladas
                </strong>{" "}
                levantadas
              </span>
              <span className="flex items-center gap-2">
                <Layers size={15} className="text-[#868CF0]" />
                <strong className="text-white font-bold">{allExerciseNames.length}</strong> exercícios rastreados
              </span>
            </div>

            <Link
              href="/workouts"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-sans font-bold text-xs uppercase tracking-wider hover:border-[#D2FB4C]/50 hover:text-[#D2FB4C] transition-all"
            >
              <Dumbbell size={14} />
              <span>Ver Rotinas</span>
            </Link>
          </div>
        </div>

        {/* BENTO CARD 2: RADAR DE RECORDES E INTENSIDADE (4 Colunas) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1A1C1E] p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.72rem] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                Recordes de Sessão
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAB03B]/15 text-[#FAB03B] border border-[#FAB03B]/20">
                Pico Histórico
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8E9296]">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-[#FAB03B]" />
                    Recorde de Tonelagem
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7277]">Em 1 Treino</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl font-black text-white">
                    {maxSessionVolume > 0 ? maxSessionVolume.toLocaleString("pt-BR") : "0"}
                  </span>
                  <span className="text-xs text-[#FAB03B] font-mono font-bold">kg</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8E9296]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#868CF0]" />
                    Média de Tempo
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7277]">Por Sessão</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl font-black text-white">
                    {avgSessionDuration}
                  </span>
                  <span className="text-xs text-[#868CF0] font-mono font-bold">minutos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#CADBD0] font-sans">
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-[#D2FB4C]" />
              <span>Status: Periodização Ativa</span>
            </span>
            <span className="text-[#D2FB4C] font-bold">Hipertrofia</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CONTEÚDO PRINCIPAL: ESTADO VAZIO OU COCKPIT BENTO */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-[30px] border border-white/5 bg-[#16181A]/40 backdrop-blur-sm">
          <Loader2 size={36} className="animate-spin text-[#D2FB4C]" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8E9296] font-sans">
            Carregando histórico e telemetria de evolução...
          </p>
        </div>
      ) : safeLogs.length === 0 ? (
        /* ESTADO VAZIO BENTO ONBOARDING STUDIO */
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#16181A] p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Auras de iluminação decorativas */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#D2FB4C]/15 blur-[90px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#868CF0]/15 blur-[90px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <Sparkles size={13} className="text-[#D2FB4C]" />
              <span>TELEMETRIA DE PROGRESSO • SEM DADOS AINDA</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-extended text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-[1.1]">
                Nenhum Histórico de Treino Registrado
              </h2>
              <p className="text-xs sm:text-sm text-[#CADBD0] max-w-xl mx-auto font-sans font-medium leading-relaxed">
                Para desbloquear os gráficos de sobrecarga progressiva, execute uma sessão na aba de rotinas. Cada série concluída alimentará este cockpit em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play size={15} fill="currentColor" />
                <span>Ir para Minhas Rotinas de Treino</span>
              </Link>
            </div>

            {/* Grid Bento demonstrativo com os pilares da tela */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/5 text-left">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D2FB4C]/10 text-[#D2FB4C]">
                  <TrendingUp size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Sobrecarga Série por Série
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Gráficos de evolução para cada exercício com histórico de carga máxima e repetições.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAB03B]/10 text-[#FAB03B]">
                  <Trophy size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Detecção de Recordes (PR)
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Celebre automaticamente novas marcas de carga máxima superadas na sua jornada.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#868CF0]/10 text-[#868CF0]">
                  <Flame size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Tonelagem por Sessão
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Soma total de volume levantado para monitorar a densidade do estímulo muscular.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* COCKPIT COMPLETO DE ANÁLISE DE CARGAS */
        <div className="space-y-6">
          {/* ========================================================= */}
          {/* DOCK BENTO: SELETOR DE EXERCÍCIO RÁPIDO & BUSCA */}
          {/* ========================================================= */}
          <div className="sticky top-2 z-30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#16181A]/95 p-2 backdrop-blur-xl shadow-xl">
            {/* Input de Busca de Exercício */}
            <div className="relative min-w-[220px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7277]"
              />
              <input
                type="text"
                placeholder="Filtrar exercício..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none transition-colors"
              />
            </div>

            {/* Pílulas de Seleção Rápida */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {filteredExerciseNames.map((name) => {
                const isSelected = selectedExercise === name;
                return (
                  <button
                    key={name}
                    onClick={() => handleSelectExercise(name)}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 font-sans ${
                      isSelected
                        ? "bg-[#D2FB4C] text-[#1E2022] shadow-[0_2px_12px_rgba(210,251,76,0.3)] font-black"
                        : "bg-white/[0.03] border border-white/5 text-[#8E9296] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{name}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E2022]" />
                    )}
                  </button>
                );
              })}

              {filteredExerciseNames.length === 0 && (
                <span className="text-xs text-[#6E7277] italic px-2">
                  Nenhum exercício encontrado com esse filtro.
                </span>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PAINEL BENTO DO EXERCÍCIO SELECIONADO & GRÁFICO */}
          {/* ========================================================= */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)] space-y-6">
            {/* Top Bar do Exercício */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C]/15 text-[#D2FB4C] border border-[#D2FB4C]/25">
                    Telemetria Individual
                  </span>
                  <span className="text-xs text-[#8E9296] font-mono">
                    {safeProgression.length} registros no histórico
                  </span>
                </div>
                <h2 className="font-extended text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1.5">
                  {selectedExercise || "Selecione um Exercício"}
                </h2>
              </div>

              {/* Seletor mobile caso haja muitos exercícios */}
              <div className="sm:hidden">
                <select
                  value={selectedExercise}
                  onChange={(e) => handleSelectExercise(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#D2FB4C] focus:outline-none"
                >
                  {allExerciseNames.map((name) => (
                    <option key={name} value={name} className="bg-[#1A1C1E] text-white">
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TRIO BENTO DE MÉTRICAS DE CARGA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Carga Inicial */}
              <div className="rounded-[22px] border border-white/10 bg-[#1A1C1E] p-5 flex flex-col justify-between space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                  Carga Inicial Registrada
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl sm:text-4xl font-black text-white">
                    {initialWeight}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#8E9296]">kg</span>
                </div>
                <span className="text-[10px] text-[#6E7277] font-sans">
                  Ponto de partida no histórico
                </span>
              </div>

              {/* Card 2: Carga Máxima (PR) */}
              <div className="rounded-[22px] border border-white/10 bg-[#1A1C1E] p-5 flex flex-col justify-between space-y-2 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-[#FAB03B]/10 blur-xl" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                    Recorde Pessoal (PR)
                  </span>
                  <Trophy size={15} className="text-[#FAB03B]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl sm:text-4xl font-black text-[#FAB03B]">
                    {currentMaxWeight}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#FAB03B]">kg</span>
                </div>
                <span className="text-[10px] text-[#FAB03B]/80 font-bold font-sans">
                  Pico de carga máxima atingido
                </span>
              </div>

              {/* Card 3: Ganho Líquido */}
              <div className="rounded-[22px] border border-white/10 bg-[#1A1C1E] p-5 flex flex-col justify-between space-y-2 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-[#D2FB4C]/10 blur-xl" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                    Evolução Líquida
                  </span>
                  <TrendingUp size={15} className="text-[#D2FB4C]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-extended text-3xl sm:text-4xl font-black ${
                      weightDifference >= 0 ? "text-[#D2FB4C]" : "text-rose-400"
                    }`}
                  >
                    {weightDifference >= 0 ? `+${weightDifference}` : weightDifference}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">kg</span>
                  {growthPercentage > 0 && (
                    <span className="ml-1 text-xs font-mono font-bold text-[#D2FB4C]">
                      (+{growthPercentage}%)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#CADBD0] font-sans font-medium">
                  {weightDifference > 0
                    ? "Hipertrofia e ganho real de força"
                    : weightDifference === 0
                    ? "Carga constante em consolidação"
                    : "Ajuste na carga ou técnica"}
                </span>
              </div>
            </div>

            {/* GRÁFICO BENTO DE SOBRECARGA PROGRESSIVA */}
            <div className="rounded-[24px] border border-white/10 bg-black/40 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[#D2FB4C]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-sans">
                    Curva de Sobrecarga Progressiva
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9296] font-mono">
                  Valores máximos de cada treino executado
                </span>
              </div>

              {loadingProgression ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 size={28} className="animate-spin text-[#D2FB4C]" />
                  <span className="mt-3 text-xs text-[#8E9296]">Atualizando curva...</span>
                </div>
              ) : safeProgression.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8E9296]">
                  Nenhum registro individual encontrado para este exercício.
                </div>
              ) : (
                <div className="pt-6">
                  {/* Gráfico de Barras Responsivo */}
                  <div className="flex items-end gap-3 sm:gap-6 h-52 overflow-x-auto pb-2 scrollbar-none">
                    {safeProgression.map((item, idx) => {
                      const maxBenchmark = Math.max(currentMaxWeight * 1.15, 20);
                      const barHeightPct = Math.min(
                        Math.max(((item.maxWeight || 0) / maxBenchmark) * 100, 16),
                        100
                      );
                      const isRecord = item.maxWeight === currentMaxWeight;

                      const dateFormatted = new Date(
                        item.workoutLog?.date || item.createdAt
                      ).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      });

                      const sessionName =
                        item.workoutLog?.workoutName || "Treino Executado";

                      return (
                        <div
                          key={item.id || idx}
                          className="group relative flex flex-col items-center justify-end h-full min-w-[54px] sm:min-w-[68px] gap-2 transition-all cursor-pointer"
                        >
                          {/* Tooltip ao passar o mouse */}
                          <div className="pointer-events-none absolute -top-12 z-20 hidden group-hover:flex flex-col items-center rounded-xl border border-white/10 bg-[#16181A] px-2.5 py-1.5 text-center shadow-2xl">
                            <span className="text-[10px] font-bold text-white whitespace-nowrap">
                              {sessionName}
                            </span>
                            <span className="text-[9px] text-[#D2FB4C] font-mono font-bold">
                              {item.maxWeight} kg • Vol: {item.totalVolume || 0} kg
                            </span>
                          </div>

                          {/* Valor da Carga no Topo da Barra */}
                          <div
                            className={`flex items-center gap-0.5 text-xs font-mono font-black ${
                              isRecord ? "text-[#FAB03B]" : "text-white"
                            }`}
                          >
                            <span>{item.maxWeight}</span>
                            <span className="text-[9px] text-[#6E7277]">kg</span>
                          </div>

                          {/* Barra Vertical com Gradiente e Glow */}
                          <div className="w-full flex justify-center">
                            <div
                              style={{ height: `${barHeightPct}%` }}
                              className={`w-7 sm:w-10 rounded-t-xl transition-all duration-500 relative ${
                                isRecord
                                  ? "bg-gradient-to-t from-[#FAB03B]/30 to-[#FAB03B] shadow-[0_0_16px_rgba(250,176,59,0.35)]"
                                  : "bg-gradient-to-t from-[#D2FB4C]/20 to-[#D2FB4C] group-hover:shadow-[0_0_16px_rgba(210,251,76,0.4)]"
                              }`}
                            >
                              {isRecord && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FAB03B] shadow-[0_0_6px_#FAB03B]" />
                              )}
                            </div>
                          </div>

                          {/* Data do Treino na Base */}
                          <span className="text-[10px] font-mono font-medium text-[#8E9296] group-hover:text-white transition-colors">
                            {dateFormatted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. HISTÓRICO GERAL DAS ÚLTIMAS SESSÕES EXECUTADAS */}
          {/* ========================================================= */}
          <div className="rounded-[28px] border border-white/10 bg-[#16181A] p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-extended text-xl font-bold text-white uppercase tracking-tight">
                  Linha do Tempo de Sessões
                </h3>
                <p className="text-xs text-[#8E9296] font-sans">
                  Histórico completo de treinos executados no GymClub
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-white">
                {safeLogs.length} sessões registradas
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {safeLogs.map((log) => {
                const totalVol = (log.exerciseLogs || []).reduce(
                  (sum, e) => sum + (Number(e.totalVolume) || 0),
                  0
                );

                const dateStr = new Date(log.date).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={log.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#1A1C1E] p-4 sm:p-5 transition-all duration-200 hover:border-[#D2FB4C]/30 hover:bg-[#1E2023]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extended text-base font-bold text-white group-hover:text-[#D2FB4C] transition-colors">
                          {log.workoutName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-[#CADBD0] border border-white/10 font-sans">
                          {log.exerciseLogs?.length || 0} Exercícios
                        </span>
                        {log.durationMinutes && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#8E9296] bg-black/30">
                            {log.durationMinutes} min
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#8E9296] font-sans">
                        <Calendar size={13} className="text-[#868CF0]" />
                        <span className="capitalize">{dateStr}</span>
                      </div>

                      {/* Mini preview dos exercícios da sessão */}
                      {log.exerciseLogs && log.exerciseLogs.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {log.exerciseLogs.slice(0, 4).map((el, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg text-[10px] bg-black/40 border border-white/5 text-[#A4A8AD] font-sans"
                            >
                              {el.exerciseName}: <strong className="text-white">{el.maxWeight}kg</strong>
                            </span>
                          ))}
                          {log.exerciseLogs.length > 4 && (
                            <span className="text-[10px] text-[#6E7277] pl-1 font-mono">
                              +{log.exerciseLogs.length - 4} mais
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Volume Total da Sessão */}
                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9296] font-sans block">
                        Volume Total Acumulado
                      </span>
                      <div className="flex items-baseline sm:justify-end gap-1.5 mt-0.5">
                        <span className="font-extended text-xl font-black text-[#D2FB4C]">
                          {totalVol.toLocaleString("pt-BR")}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
