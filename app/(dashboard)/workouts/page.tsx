"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Play,
  Trash2,
  Clock,
  Layers,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  Sparkles,
  RotateCcw,
  Flame,
  Activity,
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
  Check,
  Dumbbell,
  Timer,
  SlidersHorizontal,
} from "lucide-react";
import GymClubLogo from "@/components/ui/GymClubLogo";

interface ExerciseItem {
  id?: string;
  name: string;
  muscleGroup?: string | null;
  targetSets: number;
  targetReps: string;
  targetWeight?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
}

interface Workout {
  id: string;
  name: string;
  description?: string | null;
  dayOfWeek?: number | string | null;
  targetGroup?: string | null;
  muscleGroups?: string | null;
  estimatedMinutes?: number | null;
  exercises: ExerciseItem[];
  _count?: { logs: number };
}

const DAY_MAP: Record<string, number> = {
  "0": 0, "DOMINGO": 0, "domingo": 0, "dom": 0,
  "1": 1, "SEGUNDA": 1, "segunda": 1, "seg": 1,
  "2": 2, "TERCA": 2, "terca": 2, "ter": 2,
  "3": 3, "QUARTA": 3, "quarta": 3, "qua": 3,
  "4": 4, "QUINTA": 4, "quinta": 4, "qui": 4,
  "5": 5, "SEXTA": 5, "sexta": 5, "sex": 5,
  "6": 6, "SABADO": 6, "sabado": 6, "sab": 6,
};

function normalizeDay(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return val;
  const str = String(val).trim().toUpperCase();
  if (DAY_MAP[str] !== undefined) return DAY_MAP[str];
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? null : parsed;
}

function getWorkoutDuration(w: Workout): number {
  if (w.estimatedMinutes) return w.estimatedMinutes;
  if (!w.exercises || w.exercises.length === 0) return 45;
  const totalSeconds = w.exercises.reduce((acc, ex) => {
    const sets = ex.targetSets || 4;
    const rest = ex.restSeconds || 60;
    return acc + sets * (40 + rest);
  }, 0);
  return Math.max(25, Math.round(totalSeconds / 60));
}

interface ExecSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface ExecExercise {
  exerciseId?: string;
  name: string;
  sets: ExecSet[];
}

interface ActiveExecution {
  workout: Workout;
  startTime: Date;
  timerSeconds: number;
  timerActive: boolean;
  exercises: ExecExercise[];
}

const DAYS = [
  { val: 1, label: "Seg", full: "Segunda-feira" },
  { val: 2, label: "Ter", full: "Terça-feira" },
  { val: 3, label: "Qua", full: "Quarta-feira" },
  { val: 4, label: "Qui", full: "Quinta-feira" },
  { val: 5, label: "Sex", full: "Sexta-feira" },
  { val: 6, label: "Sáb", full: "Sábado" },
  { val: 0, label: "Dom", full: "Domingo" },
];

const MUSCLE_PRESETS = [
  "Peito & Tríceps",
  "Costas & Bíceps",
  "Pernas Completo",
  "Ombros & Trapézio",
  "Braços & Abdômen",
  "Full Body",
  "Superior Hipertrofia",
  "Inferior & Glúteo",
];

const EXERCISE_SUGGESTIONS = [
  "Supino Reto com Barra",
  "Supino Inclinado com Halteres",
  "Puxada Alta Frontal",
  "Remada Curvada com Barra",
  "Agachamento Livre",
  "Leg Press 45°",
  "Desenvolvimento com Halteres",
  "Elevação Lateral",
  "Rosca Direta com Barra W",
  "Tríceps Corda no Pulley",
  "Elevação Pélvica",
  "Stiff com Halteres",
];

interface StarterTemplate {
  name: string;
  group: string;
  day: number;
  minutes: number;
  tag: string;
  description: string;
  exercises: ExerciseItem[];
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    name: "Treino A • Push Hipertrofia",
    group: "Peito, Ombros & Tríceps",
    day: 1, // Seg
    minutes: 50,
    tag: "Push Day",
    description: "Foco em peitoral, deltoide e tríceps com movimentos compostos pesados.",
    exercises: [
      { name: "Supino Inclinado com Halteres", targetSets: 4, targetReps: "8-10", targetWeight: 26, restSeconds: 90 },
      { name: "Supino Reto com Barra", targetSets: 4, targetReps: "8-10", targetWeight: 60, restSeconds: 90 },
      { name: "Desenvolvimento com Halteres", targetSets: 3, targetReps: "10-12", targetWeight: 18, restSeconds: 60 },
      { name: "Elevação Lateral", targetSets: 4, targetReps: "12-15", targetWeight: 10, restSeconds: 60 },
      { name: "Tríceps Corda no Pulley", targetSets: 4, targetReps: "12-15", targetWeight: 25, restSeconds: 60 },
    ],
  },
  {
    name: "Treino B • Pull & Densidade",
    group: "Costas, Trapézio & Bíceps",
    day: 2, // Ter
    minutes: 50,
    tag: "Pull Day",
    description: "Dorsais densas, trapézio e flexores do braço com alta tração.",
    exercises: [
      { name: "Puxada Alta Frontal", targetSets: 4, targetReps: "10-12", targetWeight: 55, restSeconds: 90 },
      { name: "Remada Curvada com Barra", targetSets: 4, targetReps: "8-10", targetWeight: 60, restSeconds: 90 },
      { name: "Remada Baixa Triângulo", targetSets: 3, targetReps: "10-12", targetWeight: 50, restSeconds: 60 },
      { name: "Rosca Direta com Barra W", targetSets: 4, targetReps: "10-12", targetWeight: 24, restSeconds: 60 },
      { name: "Rosca Martelo Alternada", targetSets: 3, targetReps: "12-15", targetWeight: 14, restSeconds: 60 },
    ],
  },
  {
    name: "Treino C • Legs & Core",
    group: "Quadríceps, Posterior & Glúteo",
    day: 4, // Qui
    minutes: 55,
    tag: "Leg Day",
    description: "Volume e sobrecarga em quadríceps, cadeia posterior e panturrilhas.",
    exercises: [
      { name: "Agachamento Livre", targetSets: 4, targetReps: "8-10", targetWeight: 70, restSeconds: 120 },
      { name: "Leg Press 45°", targetSets: 4, targetReps: "10-12", targetWeight: 180, restSeconds: 90 },
      { name: "Cadeira Extensora", targetSets: 3, targetReps: "12-15", targetWeight: 45, restSeconds: 60 },
      { name: "Mesa Flexora", targetSets: 4, targetReps: "10-12", targetWeight: 40, restSeconds: 60 },
      { name: "Panturrilha em Pé", targetSets: 4, targetReps: "15-20", targetWeight: 60, restSeconds: 45 },
    ],
  },
];

function WorkoutsContent() {
  const searchParams = useSearchParams();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | "ALL">("ALL");

  // Modal Novo Treino
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(50);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { name: "", targetSets: 4, targetReps: "10-12", targetWeight: 0, restSeconds: 60 },
  ]);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // Execução ao Vivo
  const [activeExecution, setActiveExecution] = useState<ActiveExecution | null>(null);
  const [savingLog, setSavingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Handler para aplicar modelo pré-montado com 1 clique
  const handleApplyTemplate = (tpl: StarterTemplate) => {
    setName(tpl.name);
    setTargetGroup(tpl.group);
    setDescription(tpl.description);
    setDayOfWeek(tpl.day);
    setEstimatedMinutes(tpl.minutes);
    setExercises(tpl.exercises);
    setShowModal(true);
  };

  // Carregar treinos com validação segura de array
  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.workouts)
          ? data.workouts
          : [];
        setWorkouts(list);
      } else {
        setWorkouts([]);
      }
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Abrir modal se vier com ?create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  // Cronômetro regressivo de descanso entre séries
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeExecution && activeExecution.timerActive && activeExecution.timerSeconds > 0) {
      interval = setInterval(() => {
        setActiveExecution((prev) => {
          if (!prev) return null;
          if (prev.timerSeconds <= 1) {
            return { ...prev, timerSeconds: 0, timerActive: false };
          }
          return { ...prev, timerSeconds: prev.timerSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExecution?.timerActive, activeExecution?.timerSeconds]);

  // Handlers do Formulário de Exercícios
  const addExerciseRow = (defaultName = "") => {
    setExercises([
      ...exercises,
      {
        name: defaultName,
        targetSets: 4,
        targetReps: "10-12",
        targetWeight: 0,
        restSeconds: 60,
      },
    ]);
  };

  const removeExerciseRow = (index: number) => {
    setExercises(exercises.filter((_, idx) => idx !== index));
  };

  const updateExerciseRow = (index: number, field: keyof ExerciseItem, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  // Salvar nova rotina
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingWorkout(true);
    try {
      const validExs = exercises.filter((ex) => ex.name.trim().length > 0);
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          targetGroup: targetGroup.trim(),
          muscleGroups: targetGroup.trim(),
          dayOfWeek: String(dayOfWeek),
          estimatedMinutes,
          exercises: validExs.map((ex) => ({
            name: ex.name.trim(),
            sets: Number(ex.targetSets) || 4,
            reps: ex.targetReps || "10-12",
            weight: Number(ex.targetWeight) || 0,
            restSeconds: Number(ex.restSeconds) || 60,
          })),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setDescription("");
        setTargetGroup("");
        setExercises([
          { name: "", targetSets: 4, targetReps: "10-12", targetWeight: 0, restSeconds: 60 },
        ]);
        loadWorkouts();
      } else {
        const errData = await res.json().catch(() => null);
        console.error("Erro ao salvar treino:", errData);
        alert(errData?.error || "Erro ao salvar treino.");
      }
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
    } finally {
      setSavingWorkout(false);
    }
  };

  // Excluir ficha
  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta ficha de treino?")) return;
    try {
      const res = await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkouts((prev) => (Array.isArray(prev) ? prev.filter((w) => w.id !== id) : []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Iniciar sessão de treino ao vivo
  const handleStartWorkout = (workout: Workout) => {
    const initialExercises: ExecExercise[] = workout.exercises.map((ex) => {
      const sets: ExecSet[] = [];
      const numSets = ex.targetSets || 3;
      const baseWeight = ex.targetWeight || 0;
      const baseReps = parseInt(ex.targetReps) || 10;

      for (let s = 1; s <= numSets; s++) {
        sets.push({
          setNumber: s,
          reps: baseReps,
          weight: baseWeight,
          completed: false,
        });
      }

      return {
        exerciseId: ex.id,
        name: ex.name,
        sets,
      };
    });

    setActiveExecution({
      workout,
      startTime: new Date(),
      timerSeconds: 60,
      timerActive: false,
      exercises: initialExercises,
    });
  };

  // Alternar conclusão de série
  const handleToggleSet = (exIdx: number, setIdx: number) => {
    if (!activeExecution) return;
    const newExs = [...activeExecution.exercises];
    const targetSet = newExs[exIdx].sets[setIdx];
    const willBeCompleted = !targetSet.completed;

    targetSet.completed = willBeCompleted;

    const workoutExRest = activeExecution.workout.exercises[exIdx]?.restSeconds || 60;

    setActiveExecution({
      ...activeExecution,
      exercises: newExs,
      timerSeconds: willBeCompleted ? workoutExRest : activeExecution.timerSeconds,
      timerActive: willBeCompleted,
    });
  };

  // Finalizar e salvar histórico de execução
  const handleFinishWorkout = async () => {
    if (!activeExecution) return;
    setSavingLog(true);

    try {
      const elapsedMinutes = Math.max(
        1,
        Math.round((new Date().getTime() - activeExecution.startTime.getTime()) / 60000)
      );

      const payload = {
        workoutId: activeExecution.workout.id,
        durationMinutes: elapsedMinutes,
        notes: `Concluído em ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        exercises: activeExecution.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: Number(s.reps),
            weight: Number(s.weight),
            completed: s.completed,
          })),
        })),
      };

      const res = await fetch("/api/workouts/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLogSuccess(true);
        setTimeout(() => {
          setActiveExecution(null);
          setLogSuccess(false);
          loadWorkouts();
        }, 1600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLog(false);
    }
  };

  // Garante array blindado em todos os cálculos
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  // Filtragem dos treinos por dia com normalização segura
  const filteredWorkouts =
    selectedDay === "ALL"
      ? safeWorkouts
      : safeWorkouts.filter((w) => normalizeDay(w.dayOfWeek) === selectedDay);

  // Estatísticas calculadas
  const totalExercisesCount = safeWorkouts.reduce(
    (acc, w) => acc + (w.exercises?.length || 0),
    0
  );
  const totalWeeklyMinutes = safeWorkouts.reduce(
    (acc, w) => acc + getWorkoutDuration(w),
    0
  );
  const activeDaysCount = new Set(
    safeWorkouts
      .map((w) => normalizeDay(w.dayOfWeek))
      .filter((d) => d !== null && d !== undefined)
  ).size;

  // Cálculo de progresso de séries na sessão ativa
  const totalActiveSets =
    activeExecution?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;
  const completedActiveSets =
    activeExecution?.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    ) || 0;
  const executionPercent =
    totalActiveSets > 0
      ? Math.round((completedActiveSets / totalActiveSets) * 100)
      : 0;

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* ========================================================= */}
      {/* 1. BENTO HEADER MONUMENTAL: PERFORMANCE & CONTROLE */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* BENTO CARD 1: HERO DA ROTINA & AÇÕES PRINCIPAIS (8 Colunas) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[26px] border border-white/10 bg-[#16181A] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          {/* Auras de iluminação estilizadas */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D2FB4C]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#868CF0]/10 blur-[80px]" />

          <div className="relative z-10 space-y-4">
            {/* Tag oficial da seção */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-[#D2FB4C] shadow-[0_0_8px_#D2FB4C]" />
              SISTEMA DE TREINAMENTO • PERIODIZAÇÃO ATIVA
            </div>

            <div className="space-y-2">
              <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.05]">
                Rotinas de Treino
              </h1>
              <p className="text-xs sm:text-sm text-[#A4A8AD] max-w-xl font-sans font-medium leading-relaxed">
                Estruture suas séries com sobrecarga progressiva, execute seus treinos com cronômetro integrado de descanso e guarde cada quilo registrado.
              </p>
            </div>
          </div>

          {/* Barra de Ações Rápidas no Rodapé do Bento Card */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#8E9296] font-sans font-semibold">
              <Zap size={14} className="text-[#D2FB4C]" />
              <span>{safeWorkouts.length} rotinas ativas no seu plano</span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Plus size={16} strokeWidth={3} />
              Criar Nova Ficha
            </button>
          </div>
        </div>

        {/* BENTO CARD 2: RADAR DE FREQUÊNCIA SEMANAL (4 Colunas) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-[26px] border border-white/10 bg-[#1A1C1E] p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.72rem] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                Frequência Semanal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#CADBD0]/15 text-[#CADBD0] border border-[#CADBD0]/20">
                {activeDaysCount} de 7 Dias
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-extended text-4xl font-black text-white">
                {activeDaysCount}
              </span>
              <span className="text-xs text-[#A4A8AD] font-sans">dias cobertos com treino</span>
            </div>

            {/* Visualizador de Dias da Semana (Bolinhas iluminadas) */}
            <div className="grid grid-cols-7 gap-1.5 mt-5">
              {DAYS.map((d) => {
                const hasWorkout = safeWorkouts.some((w) => normalizeDay(w.dayOfWeek) === d.val);
                return (
                  <div
                    key={d.val}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border text-center transition-all ${
                      hasWorkout
                        ? "bg-[#D2FB4C]/10 border-[#D2FB4C]/40 text-[#D2FB4C]"
                        : "bg-white/[0.02] border-white/5 text-[#6E7277]"
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-tight">{d.label}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        hasWorkout ? "bg-[#D2FB4C] shadow-[0_0_6px_#D2FB4C]" : "bg-white/10"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#8E9296] font-sans">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#868CF0]" />
              <span>Volume: ~{totalWeeklyMinutes} min/sem</span>
            </span>
            <span className="text-white font-bold">{totalExercisesCount} exercícios</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DOCK BENTO: FILTRO DINÂMICO POR DIA DA SEMANA */}
      {/* ========================================================= */}
      <div className="sticky top-2 z-30 flex items-center justify-between overflow-x-auto rounded-2xl border border-white/10 bg-[#16181A]/90 p-1.5 backdrop-blur-xl shadow-xl scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 font-sans uppercase tracking-wider ${
              selectedDay === "ALL"
                ? "bg-[#D2FB4C] text-[#1E2022] shadow-[0_2px_10px_rgba(210,251,76,0.3)]"
                : "text-[#8E9296] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity size={14} />
            Todos ({safeWorkouts.length})
          </button>

          {DAYS.map((d) => {
            const count = safeWorkouts.filter((w) => normalizeDay(w.dayOfWeek) === d.val).length;
            const isSelected = selectedDay === d.val;
            return (
              <button
                key={d.val}
                onClick={() => setSelectedDay(d.val)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 font-sans ${
                  isSelected
                    ? "bg-[#D2FB4C] text-[#1E2022] shadow-[0_2px_10px_rgba(210,251,76,0.3)]"
                    : "text-[#8E9296] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{d.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                      isSelected ? "bg-[#1E2022]/20 text-[#1E2022]" : "bg-white/10 text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:border-[#D2FB4C]/50 hover:text-[#D2FB4C] transition-all font-sans"
        >
          <Plus size={14} />
          Nova Ficha
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. GRADE BENTO DOS CARDS DE TREINO */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-[28px] border border-white/5 bg-[#16181A]/40 backdrop-blur-sm">
          <Loader2 size={36} className="animate-spin text-[#D2FB4C]" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8E9296] font-sans">
            Carregando rotinas de treino...
          </p>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        selectedDay !== "ALL" ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#16181A] p-10 sm:p-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#D2FB4C] mb-4 shadow-[0_0_20px_rgba(210,251,76,0.15)]">
              <Calendar size={28} />
            </div>
            <h3 className="font-extended text-xl font-black text-white uppercase tracking-tight">
              Sem treinos para {DAYS.find((d) => d.val === selectedDay)?.full || "este dia"}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8E9296] max-w-sm font-sans leading-relaxed">
              Você pode programar uma ficha específica para este dia ou alternar o filtro na barra superior para visualizar outros treinos.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setDayOfWeek(selectedDay as number);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(210,251,76,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                Criar Treino para {DAYS.find((d) => d.val === selectedDay)?.label}
              </button>
              <button
                onClick={() => setSelectedDay("ALL")}
                className="px-5 py-3 rounded-full border border-white/10 text-xs font-bold text-[#A4A8AD] hover:bg-white/5 hover:text-white transition-colors font-sans"
              >
                Ver Todos os Dias
              </button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#16181A] p-6 sm:p-10 lg:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Auras de iluminação estilizadas */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#D2FB4C]/15 blur-[90px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#868CF0]/15 blur-[90px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative z-10">
              {/* Cabeçalho do Onboarding Bento */}
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans shadow-[0_0_15px_rgba(210,251,76,0.15)]">
                  <Sparkles size={13} className="text-[#D2FB4C]" />
                  <span>PERIODIZAÇÃO • PASSO INICIAL</span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-extended text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-[1.1]">
                    Monte sua Primeira Rotina
                  </h2>
                  <p className="text-xs sm:text-sm text-[#CADBD0] max-w-lg font-sans font-medium leading-relaxed">
                    Você ainda não possui fichas ativas no seu plano. Crie um treino customizado do zero ou selecione um dos nossos modelos profissionais abaixo com 1 clique.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setName("");
                    setTargetGroup("");
                    setDescription("");
                    setExercises([
                      { name: "", targetSets: 4, targetReps: "10-12", targetWeight: 0, restSeconds: 60 },
                    ]);
                    setShowModal(true);
                  }}
                  className="mt-2 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus size={16} strokeWidth={3} />
                  Criar Ficha do Zero
                </button>
              </div>

              {/* Divisor Bento */}
              <div className="my-8 sm:my-10 flex items-center justify-between gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans px-2">
                  Ou acelere escolhendo um modelo pronto
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Grade Bento com 3 Modelos Prontos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STARTER_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.name}
                    className="group relative flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#1A1C1E] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#D2FB4C]/50 hover:bg-[#1E2023] hover:shadow-[0_8px_24px_rgba(210,251,76,0.15)]"
                  >
                    <div>
                      {/* Topo do Card do Modelo */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C]/15 text-[#D2FB4C] border border-[#D2FB4C]/25 font-sans">
                          {tpl.tag}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#8E9296] flex items-center gap-1">
                          <Clock size={12} className="text-[#868CF0]" />
                          ~{tpl.minutes} min
                        </span>
                      </div>

                      <h3 className="font-extended text-base font-bold text-white group-hover:text-[#D2FB4C] transition-colors">
                        {tpl.name}
                      </h3>

                      <p className="mt-1 text-[11px] font-bold text-[#CADBD0] font-sans">
                        {tpl.group}
                      </p>

                      <p className="mt-2 text-xs text-[#8E9296] line-clamp-2 leading-relaxed font-sans">
                        {tpl.description}
                      </p>

                      {/* Lista de Exercícios inclusos */}
                      <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E7277] font-sans block mb-1">
                          {tpl.exercises.length} Exercícios inclusos:
                        </span>
                        {tpl.exercises.slice(0, 3).map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px] text-[#A4A8AD] font-sans"
                          >
                            <span className="truncate pr-2">• {ex.name}</span>
                            <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                              {ex.targetSets}x{ex.targetReps}
                            </span>
                          </div>
                        ))}
                        {tpl.exercises.length > 3 && (
                          <span className="text-[10px] text-[#D2FB4C] font-semibold block pt-0.5">
                            + {tpl.exercises.length - 3} outros movimentos
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão de Ação do Modelo */}
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold font-sans text-white group-hover:border-[#D2FB4C] group-hover:bg-[#D2FB4C] group-hover:text-[#1E2022] transition-all duration-200"
                    >
                      <span>Usar este Modelo</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pilares Técnicos no Rodapé */}
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-[#A4A8AD] font-sans">
                  <Zap size={14} className="text-[#D2FB4C]" />
                  <span>Sobrecarga Progressiva</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#A4A8AD] font-sans">
                  <Timer size={14} className="text-[#868CF0]" />
                  <span>Cronômetro Automático</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#A4A8AD] font-sans">
                  <Activity size={14} className="text-[#CADBD0]" />
                  <span>Histórico de Cargas</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#A4A8AD] font-sans">
                  <Target size={14} className="text-[#FAB03B]" />
                  <span>Divisão Inteligente</span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredWorkouts.map((w) => {
            const normalizedDay = normalizeDay(w.dayOfWeek);
            const dayName =
              DAYS.find((d) => d.val === normalizedDay)?.full || "Dia Flexível";
            const muscleGroupLabel = w.muscleGroups || w.targetGroup;

            return (
              <div
                key={w.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/10 bg-[#16181A] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-[#D2FB4C]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                {/* Glow decorativo de fundo */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D2FB4C]/0 blur-[60px] transition-all duration-500 group-hover:bg-[#D2FB4C]/10" />

                <div>
                  {/* Top Bar do Card com Grupo Muscular e Dia */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {muscleGroupLabel && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C]/15 text-[#D2FB4C] border border-[#D2FB4C]/25 font-sans">
                            {muscleGroupLabel}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#A4A8AD] bg-white/[0.04] border border-white/10 font-sans">
                          {dayName}
                        </span>
                      </div>

                      <h2 className="font-extended text-xl font-black text-white tracking-tight mt-1 group-hover:text-[#D2FB4C] transition-colors">
                        {w.name}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="rounded-xl p-2 text-[#6E7277] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Excluir ficha"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {w.description && (
                    <p className="mt-2.5 text-xs text-[#8E9296] line-clamp-2 leading-relaxed font-sans">
                      {w.description}
                    </p>
                  )}

                  {/* Informações Rápidas em Pílula HUD */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#8E9296] border-y border-white/5 py-3 font-sans">
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} className="text-[#D2FB4C]" />
                      <strong className="text-white font-bold">{w.exercises.length}</strong> exercícios
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#868CF0]" />
                      <strong className="text-white font-bold">{getWorkoutDuration(w)}</strong> min
                    </span>
                    {w._count && (
                      <span className="flex items-center gap-1.5 ml-auto text-[11px] text-[#CADBD0]">
                        <Flame size={13} className="text-[#FAB03B]" />
                        <strong>{w._count.logs}</strong> concluídos
                      </span>
                    )}
                  </div>

                  {/* Lista Resumida dos Exercícios da Ficha */}
                  <div className="mt-4 space-y-1.5">
                    {w.exercises.slice(0, 5).map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2 text-xs transition-colors hover:bg-white/[0.035]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-[#8E9296] font-mono">
                            {idx + 1}
                          </span>
                          <span className="truncate font-semibold text-zinc-200 font-sans">
                            {ex.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 text-[#8E9296]">
                          <span className="font-mono text-[11px] text-[#D2FB4C] font-bold">
                            {ex.targetSets} × {ex.targetReps}
                          </span>
                          {ex.targetWeight ? (
                            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white font-mono">
                              {ex.targetWeight}kg
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    {w.exercises.length > 5 && (
                      <div className="pt-1 text-center">
                        <span className="text-[11px] font-semibold text-[#6E7277] font-sans">
                          + {w.exercises.length - 5} outros exercícios na ficha
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão Principal de Ação: Iniciar Treino */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleStartWorkout(w)}
                    className="flex w-full items-center justify-center gap-2.5 py-3 rounded-full bg-white/[0.06] text-white border border-white/10 text-xs font-black uppercase tracking-wider font-sans hover:bg-[#D2FB4C] hover:text-[#1E2022] hover:border-[#D2FB4C] hover:shadow-[0_0_20px_rgba(210,251,76,0.3)] active:scale-[0.98] transition-all duration-200"
                  >
                    <Play size={14} fill="currentColor" />
                    Iniciar Treino Agora
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL STUDIO: CRIAR NOVA FICHA DE TREINO (BENTO FORMS) */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/15 bg-[#16181A] p-6 sm:p-8 shadow-2xl scrollbar-none">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#D2FB4C] font-sans">
                  <Sparkles size={12} />
                  NOVA ROTINA DE HIPERTROFIA
                </div>
                <h3 className="font-extended text-2xl font-black text-white uppercase tracking-tight">
                  Criar Ficha de Treino
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-white/10 p-2 text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkout} className="mt-6 space-y-6">
              {/* BENTO FORM SECTION 1: DADOS GERAIS */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 sm:p-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                  1. Informações Básicas
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#CADBD0] font-sans">
                      Nome da Ficha *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Treino A • Peito & Tríceps"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none transition-colors font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#CADBD0] font-sans">
                      Foco Muscular
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Peito, Deltóide & Tríceps"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Chips de Atalhos de Foco Muscular */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#6E7277] uppercase font-bold mr-1">Sugestões:</span>
                  {MUSCLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetGroup(preset)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.03] border border-white/10 text-[#A4A8AD] hover:border-[#D2FB4C] hover:text-[#D2FB4C] transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#CADBD0] font-sans">
                    Orientações ou Observações
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Descansar 90s nos compostos. Focar em cadência controlada na descida."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none transition-colors font-sans resize-none"
                  />
                </div>
              </div>

              {/* BENTO FORM SECTION 2: AGENDAMENTO E TEMPO */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 sm:p-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                  2. Agendamento & Duração Estimada
                </span>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#CADBD0] font-sans">
                    Dia Recomendado da Semana
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {DAYS.map((d) => {
                      const isSelected = dayOfWeek === d.val;
                      return (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => setDayOfWeek(d.val)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                            isSelected
                              ? "bg-[#D2FB4C] text-[#1E2022] font-black shadow-[0_2px_10px_rgba(210,251,76,0.3)]"
                              : "bg-white/[0.03] border border-white/10 text-[#8E9296] hover:bg-white/5"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#CADBD0] font-sans">
                      Duração Prevista do Treino
                    </label>
                    <span className="font-mono text-xs font-bold text-[#D2FB4C]">
                      {estimatedMinutes} minutos
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={150}
                    step={5}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full accent-[#D2FB4C]"
                  />
                </div>
              </div>

              {/* BENTO FORM SECTION 3: GRADE DE EXERCÍCIOS */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                      3. Exercícios da Rotina
                    </span>
                    <p className="text-xs text-white font-bold font-sans">
                      Total: {exercises.length} movimentos configurados
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addExerciseRow()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D2FB4C]/15 border border-[#D2FB4C]/30 text-[#D2FB4C] text-xs font-bold font-sans hover:bg-[#D2FB4C] hover:text-[#1E2022] transition-colors"
                  >
                    <Plus size={14} /> Adicionar Exercício
                  </button>
                </div>

                {/* Sugestões Rápidas de Exercícios para Inclusão */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  <span className="text-[10px] text-[#6E7277] uppercase font-bold shrink-0">
                    + Inserir:
                  </span>
                  {EXERCISE_SUGGESTIONS.slice(0, 6).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addExerciseRow(sug)}
                      className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.03] border border-white/10 text-zinc-300 hover:border-[#D2FB4C] hover:text-[#D2FB4C] transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {/* Lista de Exercícios Adicionados */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#D2FB4C]/15 text-[#D2FB4C] font-mono text-xs font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Nome do exercício (ex: Supino Inclinado com Halteres)"
                          value={ex.name}
                          onChange={(e) => updateExerciseRow(idx, "name", e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none transition-colors font-sans"
                        />
                        {exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExerciseRow(idx)}
                            className="p-1.5 text-[#6E7277] hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors"
                            title="Remover exercício"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Parâmetros: Séries, Reps, Carga e Descanso */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-[#8E9296] font-sans">
                            Séries
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={ex.targetSets}
                            onChange={(e) =>
                              updateExerciseRow(idx, "targetSets", Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-center font-mono text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8E9296] font-sans">
                            Repetições
                          </label>
                          <input
                            type="text"
                            placeholder="10-12"
                            value={ex.targetReps}
                            onChange={(e) =>
                              updateExerciseRow(idx, "targetReps", e.target.value)
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-center font-mono text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8E9296] font-sans">
                            Carga Base (kg)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={ex.targetWeight || ""}
                            onChange={(e) =>
                              updateExerciseRow(idx, "targetWeight", Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-center font-mono text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8E9296] font-sans">
                            Descanso (s)
                          </label>
                          <input
                            type="number"
                            min={15}
                            step={15}
                            value={ex.restSeconds || 60}
                            onChange={(e) =>
                              updateExerciseRow(idx, "restSeconds", Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-center font-mono text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações do Rodapé do Modal */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-bold text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingWorkout}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D2FB4C] text-[#1E2022] text-xs font-black uppercase tracking-wider font-sans shadow-[0_0_20px_rgba(210,251,76,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {savingWorkout ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Salvando Ficha...
                    </>
                  ) : (
                    "Salvar Ficha de Treino"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL COCKPIT: EXECUÇÃO AO VIVO (HUD WORKOUT TRACKER) */}
      {/* ========================================================= */}
      {activeExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl animate-fade-in">
          <div className="relative flex flex-col max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/15 bg-[#16181A] shadow-2xl">
            {/* Header HUD do Cockpit */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 bg-gradient-to-r from-white/[0.04] to-transparent">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[10px] font-black uppercase tracking-wider text-[#D2FB4C] font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#D2FB4C] animate-pulse shadow-[0_0_8px_#D2FB4C]" />
                  EXECUÇÃO AO VIVO • COCKPIT GYMCLUB
                </div>
                <h3 className="font-extended text-2xl font-black text-white uppercase tracking-tight">
                  {activeExecution.workout.name}
                </h3>
              </div>

              <button
                onClick={() => setActiveExecution(null)}
                className="rounded-full border border-white/10 p-2.5 text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
                title="Fechar Cockpit"
              >
                <X size={18} />
              </button>
            </div>

            {/* Barra de Progresso e Cronômetro de Descanso */}
            <div className="border-b border-white/10 bg-[#1A1C1E] px-5 py-4 sm:px-6 space-y-3">
              {/* Barra de Progresso da Sessão */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-[#8E9296] font-semibold">Progresso da Sessão:</span>
                  <span className="text-[#D2FB4C] font-black font-mono">
                    {completedActiveSets} de {totalActiveSets} séries ({executionPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                  <div
                    className="h-full bg-[#D2FB4C] transition-all duration-300 shadow-[0_0_10px_#D2FB4C]"
                    style={{ width: `${executionPercent}%` }}
                  />
                </div>
              </div>

              {/* Painel do Cronômetro de Descanso */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[#D2FB4C]">
                    <Timer size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                      Descanso entre Séries
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-black text-[#D2FB4C] tracking-tight">
                        {activeExecution.timerSeconds}s
                      </span>
                      {activeExecution.timerActive && (
                        <span className="text-[11px] font-bold text-[#D2FB4C] animate-pulse font-sans">
                          • cronômetro ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecution({
                        ...activeExecution,
                        timerSeconds: 90,
                        timerActive: true,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors font-sans"
                  >
                    90s
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecution({
                        ...activeExecution,
                        timerSeconds: 60,
                        timerActive: true,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors font-sans"
                  >
                    60s
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecution({
                        ...activeExecution,
                        timerSeconds: 45,
                        timerActive: true,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors font-sans"
                  >
                    45s
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecution({
                        ...activeExecution,
                        timerSeconds: 0,
                        timerActive: false,
                      })
                    }
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-[#8E9296] hover:text-white transition-colors"
                    title="Zerar"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Banner de Feedback Concluído */}
            {logSuccess && (
              <div className="flex items-center gap-3 bg-[#D2FB4C]/15 border-b border-[#D2FB4C]/30 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#D2FB4C] animate-fade-in font-sans">
                <CheckCircle2 size={18} />
                Treino concluído com sucesso e gravado no histórico de evolução!
              </div>
            )}

            {/* Lista Interativa de Exercícios e Séries */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {activeExecution.exercises.map((ex, exIdx) => (
                <div
                  key={ex.exerciseId || exIdx}
                  className="rounded-2xl border border-white/10 bg-white/[0.015] p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D2FB4C]/15 text-[#D2FB4C] font-mono text-xs font-bold">
                        {exIdx + 1}
                      </span>
                      <h4 className="font-extended text-base font-bold text-white">
                        {ex.name}
                      </h4>
                    </div>

                    <span className="text-xs text-[#8E9296] font-mono">
                      {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} séries concluídas
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-[#6E7277] px-3 font-sans">
                      <div className="col-span-2">Série</div>
                      <div className="col-span-3">Carga (kg)</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-4 text-right">Ação</div>
                    </div>

                    {ex.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className={`grid grid-cols-12 gap-2 items-center rounded-xl p-2.5 transition-all ${
                          set.completed
                            ? "bg-[#D2FB4C]/10 border border-[#D2FB4C]/30 text-white"
                            : "bg-black/30 border border-white/5 text-[#A4A8AD] hover:bg-black/50"
                        }`}
                      >
                        <div className="col-span-2 font-mono text-xs font-bold text-white">
                          #{set.setNumber}
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => {
                              const newExs = [...activeExecution.exercises];
                              newExs[exIdx].sets[setIdx].weight = Number(e.target.value);
                              setActiveExecution({ ...activeExecution, exercises: newExs });
                            }}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-xs font-mono text-center text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const newExs = [...activeExecution.exercises];
                              newExs[exIdx].sets[setIdx].reps = Number(e.target.value);
                              setActiveExecution({ ...activeExecution, exercises: newExs });
                            }}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-xs font-mono text-center text-white focus:border-[#D2FB4C] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleSet(exIdx, setIdx)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all ${
                              set.completed
                                ? "bg-[#D2FB4C] text-[#1E2022] font-black shadow-[0_0_12px_rgba(210,251,76,0.35)]"
                                : "border border-white/10 bg-white/5 text-[#A4A8AD] hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Check size={13} strokeWidth={set.completed ? 3 : 2} />
                            {set.completed ? "Feito" : "Concluir"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do Cockpit: Ações */}
            <div className="border-t border-white/10 bg-[#16181A] p-5 sm:p-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveExecution(null)}
                className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors font-sans"
              >
                Descartar Sessão
              </button>

              <button
                type="button"
                disabled={savingLog}
                onClick={handleFinishWorkout}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#D2FB4C] text-[#1E2022] text-xs font-black uppercase tracking-wider font-sans shadow-[0_0_24px_rgba(210,251,76,0.4)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {savingLog ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Registrando no Histórico...
                  </>
                ) : (
                  <>
                    <Flame size={16} /> Finalizar Treino Completo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#D2FB4C]" size={36} />
        </div>
      }
    >
      <WorkoutsContent />
    </Suspense>
  );
}
