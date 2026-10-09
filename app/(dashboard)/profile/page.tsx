"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  Camera,
  CheckCircle2,
  Target,
  Scale,
  Ruler,
  ShieldCheck,
  Save,
  Loader2,
  Mail,
  Dumbbell,
  Flame,
  Zap,
  Activity,
  Sparkles,
  Droplets,
  HeartPulse,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  X,
  LogOut,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  targetGoal: string | null;
  currentWeight: number | null;
  height: number | null;
  emailVerified: string | null;
  createdAt?: string;
  _count?: {
    workouts: number;
    workoutLogs: number;
    progressPhotos: number;
  };
}

const GOAL_OPTIONS = [
  {
    id: "HIPERTROFIA",
    label: "Hipertrofia",
    subtitle: "Ganho de massa magra & volume",
    icon: Dumbbell,
    accentColor: "#D2FB4C",
  },
  {
    id: "EMAGRECIMENTO",
    label: "Emagrecimento",
    subtitle: "Definição & queima calórica",
    icon: Flame,
    accentColor: "#FF6B6B",
  },
  {
    id: "FORCA",
    label: "Força / Cargas",
    subtitle: "Progressão máxima & potência",
    icon: Zap,
    accentColor: "#38BDF8",
  },
  {
    id: "CONDICIONAMENTO",
    label: "Condicionamento",
    subtitle: "Resistência física & mobilidade",
    icon: Activity,
    accentColor: "#868CF0",
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [targetGoal, setTargetGoal] = useState("HIPERTROFIA");
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        const u = data.user as ProfileData;
        setProfile(u);
        setName(u.name || "");
        setBio(u.bio || "");
        setTargetGoal(u.targetGoal || "HIPERTROFIA");
        setCurrentWeight(u.currentWeight ? u.currentWeight.toString() : "");
        setHeight(u.height ? u.height.toString() : "");
        if (u.image) setAvatarPreview(u.image);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setAvatarFile(selected);
      setAvatarPreview(URL.createObjectURL(selected));
    }
  };

  const handleCancelNewAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.image || null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      let res;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("name", name);
        formData.append("bio", bio);
        formData.append("targetGoal", targetGoal);
        if (currentWeight) formData.append("currentWeight", currentWeight);
        if (height) formData.append("height", height);

        res = await fetch("/api/profile", {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            bio,
            targetGoal,
            currentWeight: currentWeight ? parseFloat(currentWeight) : null,
            height: height ? parseFloat(height) : null,
          }),
        });
      }

      if (res.ok) {
        setFeedback({
          type: "success",
          message: "Passaporte biométrico atualizado com sucesso!",
        });
        setAvatarFile(null);
        fetchProfile();
      } else {
        setFeedback({
          type: "error",
          message: "Erro ao salvar alterações no perfil.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro de conexão ao salvar alterações.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Cálculos Biométricos em Tempo Real
  const numWeight = parseFloat(currentWeight) || 0;
  const numHeight = parseFloat(height) || 0;

  // IMC (kg / m²)
  let bmiValue: number | null = null;
  let bmiCategory = "Pendente";
  let bmiColor = "#8E9296";

  if (numWeight > 0 && numHeight > 0) {
    const heightInMeters = numHeight / 100;
    bmiValue = Math.round((numWeight / (heightInMeters * heightInMeters)) * 10) / 10;

    if (bmiValue < 18.5) {
      bmiCategory = "Abaixo do Peso";
      bmiColor = "#38BDF8";
    } else if (bmiValue < 24.9) {
      bmiCategory = "Faixa Ideal / Saudável";
      bmiColor = "#D2FB4C";
    } else if (bmiValue < 29.9) {
      bmiCategory = "Sobrepeso / Massa Magra";
      bmiColor = "#FAB03B";
    } else {
      bmiCategory = "Obesidade / Força Pesada";
      bmiColor = "#FF6B6B";
    }
  }

  // Taxa Metabólica Basal Estimada (TMB)
  let estimatedTMB: number | null = null;
  let waterTargetLitres: number | null = null;

  if (numWeight > 0 && numHeight > 0) {
    // Estimativa aproximada de TMB baseada em peso e altura
    estimatedTMB = Math.round(10 * numWeight + 6.25 * numHeight - 5 * 25 + 5);
    // Recomendação hídrica padrão: 35ml por kg corporal
    waterTargetLitres = Math.round((numWeight * 0.035) * 10) / 10;
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "Atleta Recente";

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 text-center animate-fade-in font-sans">
        <Loader2 size={40} className="animate-spin text-[#D2FB4C]" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#6E7277]">
          Carregando passaporte biométrico do atleta...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in font-sans">
      {/* ========================================================= */}
      {/* 1. BENTO HEADER MONUMENTAL: PASSAPORTE & TELEMETRIA */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* HERO CARD (8 Colunas) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          {/* Auras de iluminação futurista */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D2FB4C]/15 blur-[80px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#868CF0]/10 blur-[80px]" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-[#D2FB4C] shadow-[0_0_8px_#D2FB4C]" />
              PASSAPORTE DO ATLETA • BIOMETRIA & IDENTIDADE
            </div>

            <div className="space-y-2">
              <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.05]">
                Perfil & Biometria
              </h1>
              <p className="text-xs sm:text-sm text-[#A4A8AD] max-w-xl font-sans font-medium leading-relaxed">
                Mantenha seus dados corporais calibrados. O GymCoach IA utiliza seu peso, altura e objetivo para calcular o volume de treino ideal e sugerir sobrecarga progressiva personalizada.
              </p>
            </div>
          </div>

          {/* Rodapé do Hero com Status e Badges Rápidas */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E9296] font-sans">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 size={15} />
                <span>Conta Verificada</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#868CF0]" />
                <span>Membro desde <strong className="text-white capitalize">{memberSince}</strong></span>
              </span>

              <span className="flex items-center gap-1.5 font-mono">
                <ShieldCheck size={14} className="text-[#D2FB4C]" />
                <span className="text-white">ID: #{profile?.id.slice(-6).toUpperCase()}</span>
              </span>
            </div>

            <Link
              href="/ai-coach"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D2FB4C] text-[#1E2022] hover:bg-[#D8FD50] font-sans font-bold text-xs shadow-[0_0_16px_rgba(210,251,76,0.25)] transition-all"
            >
              <Sparkles size={14} />
              <span>Calibrar no Coach IA</span>
            </Link>
          </div>
        </div>

        {/* CARD STUDIO AVATAR & RESUMO RÁPIDO (4 Colunas) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1A1C1E] p-6 sm:p-7 flex flex-col items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)] text-center">
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Moldura do Avatar Monumental com Borda Neon */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4 group">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#D2FB4C] shadow-[0_0_24px_rgba(210,251,76,0.3)] relative bg-[#0E1012]">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={name || "Avatar"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#D2FB4C]/10 text-[#D2FB4C] font-mono text-3xl font-black">
                    {name ? name.slice(0, 2).toUpperCase() : "GC"}
                  </div>
                )}
              </div>

              {/* Botão de Câmera Flutuante */}
              <label
                htmlFor="avatar-upload-input"
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#D2FB4C] text-[#1E2022] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Trocar avatar"
              >
                <Camera size={17} strokeWidth={2.5} />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {/* Se houver arquivo pendente de salvar, permite cancelar */}
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleCancelNewAvatar}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                  title="Cancelar foto pendente"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Nome & Email */}
            <h2 className="font-extended text-lg sm:text-xl font-bold text-white tracking-tight truncate max-w-full">
              {name || "Atleta Sem Nome"}
            </h2>
            <p className="text-xs text-[#8E9296] font-mono truncate max-w-full mt-0.5">
              {profile?.email}
            </p>

            {avatarFile && (
              <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2FB4C]/20 border border-[#D2FB4C]/40 text-[10px] font-bold text-[#D2FB4C] animate-pulse">
                Foto pronta para salvar
              </span>
            )}
          </div>

          {/* Troféus do Ecossistema GymClub */}
          <div className="w-full grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-white/5">
            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="text-[10px] uppercase font-bold text-[#8E9296]">Treinos</div>
              <div className="font-extended text-base sm:text-lg font-black text-white mt-0.5">
                {profile?._count?.workouts || 0}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="text-[10px] uppercase font-bold text-[#8E9296]">Sessões</div>
              <div className="font-extended text-base sm:text-lg font-black text-[#D2FB4C] mt-0.5">
                {profile?._count?.workoutLogs || 0}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <div className="text-[10px] uppercase font-bold text-[#8E9296]">Fotos</div>
              <div className="font-extended text-base sm:text-lg font-black text-[#868CF0] mt-0.5">
                {profile?._count?.progressPhotos || 0}
              </div>
            </div>
          </div>

          {/* Botão Sair da Conta / Logout */}
          <div className="w-full pt-4 mt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogOut size={14} />
              <span>Encerrar Sessão (Sair)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FEEDBACK TOAST / ALERTA DE SUCESSO OU ERRO */}
      {/* ========================================================= */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all animate-scale-up ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BENTO GRID: TELEMETRIA BIOMÉTRICA & FORMULÁRIO STUDIO */}
      {/* ========================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* CARD ESQUERDO: CALCULADORA DE BIOMETRIA & METABOLISMO (5 Colunas) */}
          <div className="lg:col-span-5 rounded-[28px] border border-black/5 bg-white p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E2022] text-[#D2FB4C]">
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h3 className="font-extended text-base font-bold text-[#1E2022] uppercase tracking-tight">
                      Telemetria Corporal
                    </h3>
                    <p className="text-[11px] text-[#8E9296]">Cálculos ao vivo baseados em peso e altura</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F7F6F2] text-[#1E2022] border border-black/5">
                  DINÂMICO
                </span>
              </div>

              {/* CARD DESTAQUE IMC */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F6F2] border border-black/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8E9296] font-bold uppercase tracking-wider text-[10px]">
                    Índice de Massa Corporal (IMC)
                  </span>
                  <span
                    className="font-bold text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${bmiColor}20`, color: bmiColor }}
                  >
                    {bmiCategory}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl sm:text-4xl font-black text-[#1E2022]">
                    {bmiValue !== null ? bmiValue.toFixed(1) : "--"}
                  </span>
                  <span className="text-xs text-[#8E9296] font-mono">kg/m²</span>
                </div>

                {/* Barra Gráfica de Escala IMC */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden flex">
                    <div className="h-full bg-[#38BDF8] w-[25%]" title="Abaixo do peso (< 18.5)" />
                    <div className="h-full bg-[#D2FB4C] w-[35%]" title="Normal (18.5 - 24.9)" />
                    <div className="h-full bg-[#FAB03B] w-[25%]" title="Sobrepeso (25 - 29.9)" />
                    <div className="h-full bg-[#FF6B6B] w-[15%]" title="Obesidade (30+)" />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-[#8E9296]">
                    <span>18.5</span>
                    <span>24.9</span>
                    <span>29.9</span>
                    <span>35+</span>
                  </div>
                </div>
              </div>

              {/* TELEMETRIAS AUXILIARES (TMB & ÁGUA) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-black/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9296] uppercase">
                    <Flame size={13} className="text-[#FF6B6B]" />
                    <span>TMB Estimada</span>
                  </div>
                  <div className="font-extended text-lg font-black text-[#1E2022]">
                    {estimatedTMB ? `${estimatedTMB} kcal` : "--"}
                  </div>
                  <div className="text-[10px] text-[#8E9296] leading-tight">
                    Gasto basal diário em repouso
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-black/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E9296] uppercase">
                    <Droplets size={13} className="text-[#38BDF8]" />
                    <span>Meta de Água</span>
                  </div>
                  <div className="font-extended text-lg font-black text-[#1E2022]">
                    {waterTargetLitres ? `${waterTargetLitres} L / dia` : "--"}
                  </div>
                  <div className="text-[10px] text-[#8E9296] leading-tight">
                    Hidratação celular sugerida
                  </div>
                </div>
              </div>

              {/* Card Dica Coach */}
              <div className="p-4 rounded-2xl bg-[#1E2022] text-white space-y-1.5 relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D2FB4C]">
                  <Sparkles size={14} />
                  <span>Dica de Periodização</span>
                </div>
                <p className="text-[11px] text-[#CADBD0] leading-relaxed">
                  Para atletas de musculação, o IMC pode ser elevado devido à alta densidade muscular. Combine esses dados com o <Link href="/photos" className="text-[#D2FB4C] underline">Cofre de Fotos</Link> para avaliar composição visual.
                </p>
              </div>
            </div>
          </div>

          {/* CARD DIREITO: FORMULÁRIO STUDIO DE ATUALIZAÇÃO (7 Colunas) */}
          <div className="lg:col-span-7 rounded-[28px] border border-black/5 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div>
                  <h3 className="font-extended text-lg font-bold text-[#1E2022] uppercase tracking-tight">
                    Dados do Atleta
                  </h3>
                  <p className="text-xs text-[#8E9296]">Personalize seu nome, objetivos de treino e biometria</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} />
                  <span>Criptografia Ativa</span>
                </div>
              </div>

              {/* Grid de Inputs Principais */}
              <div className="space-y-4">
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
                    <User size={13} className="text-[#8E9296]" />
                    <span>Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Paulo Silva"
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#F7F6F2] text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none focus:border-[#1E2022] focus:bg-white transition-all font-sans font-medium"
                  />
                </div>

                {/* Email (Desabilitado / Protegido) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-[#8E9296]" />
                      <span>E-mail Registrado</span>
                    </span>
                    <span className="text-[10px] text-[#8E9296] font-mono lowercase">protegido para login</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-black/[0.04] text-sm text-[#8E9296] font-mono cursor-not-allowed select-none"
                  />
                </div>

                {/* Grid Peso e Altura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
                      <Scale size={13} className="text-[#8E9296]" />
                      <span>Peso Atual (kg)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="30"
                        max="300"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="Ex: 82.5"
                        className="w-full pl-4 pr-12 py-3 rounded-2xl border border-black/10 bg-[#F7F6F2] text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none focus:border-[#1E2022] focus:bg-white transition-all font-mono font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E9296] font-mono">
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
                      <Ruler size={13} className="text-[#8E9296]" />
                      <span>Altura (cm)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="100"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Ex: 180"
                        className="w-full pl-4 pr-12 py-3 rounded-2xl border border-black/10 bg-[#F7F6F2] text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none focus:border-[#1E2022] focus:bg-white transition-all font-mono font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E9296] font-mono">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seletor Visual de Objetivo de Treino (Bento Dock) */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
                    <Target size={13} className="text-[#8E9296]" />
                    <span>Objetivo de Treino Principal</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {GOAL_OPTIONS.map((g) => {
                      const Icon = g.icon;
                      const isSelected = targetGoal === g.id;

                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setTargetGoal(g.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "bg-[#1E2022] border-[#1E2022] text-white shadow-md"
                              : "bg-[#F7F6F2] border-black/5 text-[#1E2022] hover:bg-white hover:border-black/15"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? "bg-[#D2FB4C] text-[#1E2022]"
                                : "bg-white text-[#8E9296] shadow-sm"
                            }`}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="overflow-hidden">
                            <div className="font-bold text-xs leading-tight">{g.label}</div>
                            <div
                              className={`text-[10px] leading-tight truncate mt-0.5 ${
                                isSelected ? "text-[#CADBD0]" : "text-[#8E9296]"
                              }`}
                            >
                              {g.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Biografia / Lema de Treino */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E2022] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#8E9296]" />
                    <span>Biografia & Lema de Treino</span>
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ex: Focado em sobrecarga progressiva nos básicos, consistência semanal e recuperação."
                    className="w-full p-4 rounded-2xl border border-black/10 bg-[#F7F6F2] text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none focus:border-[#1E2022] focus:bg-white transition-all font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Ações do Formulário */}
            <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-[#8E9296]">
                Todos os dados são atualizados instantaneamente no sistema.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1E2022] text-white hover:bg-black font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#D2FB4C]" />
                    <span>Salvando Alterações...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="text-[#D2FB4C]" />
                    <span>Salvar Passaporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ========================================================= */}
      {/* 4. BENTO FOOTER: ECOSSISTEMA & ATALHOS RÁPIDOS */}
      {/* ========================================================= */}
      <div className="rounded-[28px] border border-black/5 bg-[#F0EEE6] p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
          <div>
            <h4 className="font-extended text-sm font-black text-[#1E2022] uppercase tracking-tight">
              Ecossistema GymClub Integrado
            </h4>
            <p className="text-[11px] text-[#8E9296]">Navegue diretamente para os módulos de alta performance</p>
          </div>

          <span className="text-[10px] font-mono text-[#8E9296]">
            Ambiente Seguro • VPS Storage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/workouts"
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#868CF0]/10 text-[#868CF0]">
                <Dumbbell size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E2022]">Rotinas de Treino</div>
                <div className="text-[10px] text-[#8E9296]">{profile?._count?.workouts || 0} rotinas ativas</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-[#8E9296] group-hover:text-[#1E2022] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/evolution"
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAB03B]/10 text-[#FAB03B]">
                <TrendingUp size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E2022]">Evolução de Cargas</div>
                <div className="text-[10px] text-[#8E9296]">{profile?._count?.workoutLogs || 0} sessões logadas</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-[#8E9296] group-hover:text-[#1E2022] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/photos"
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border border-black/5 hover:border-black/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#38BDF8]">
                <Camera size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E2022]">Cofre de Fotos</div>
                <div className="text-[10px] text-[#8E9296]">{profile?._count?.progressPhotos || 0} fotos salvas</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-[#8E9296] group-hover:text-[#1E2022] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/ai-coach"
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#1E2022] text-white hover:bg-black transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D2FB4C]/20 text-[#D2FB4C]">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">GymCoach IA</div>
                <div className="text-[10px] text-[#CADBD0]">Chat em tempo real</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-[#D2FB4C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
