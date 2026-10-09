"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GymClubLogo from "@/components/ui/GymClubLogo";
import { AuthWireframeEffect } from "@/components/auth/AuthWireframeEffect";
import { loginSchema } from "@/lib/validations/auth";
import { toast } from "@/components/ui/sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const verifiedNotice = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setUnverifiedEmail(null);

    // Validação Zod
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFieldErrors(errors);

      const firstMsg = validationResult.error.issues[0]?.message;
      toast.error("Atenção nas credenciais", {
        description: firstMsg || "Verifique o e-mail e a senha digitados.",
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Autenticando suas credenciais...");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        toast.dismiss(toastId);

        if (res.error.includes("EMAIL_NOT_VERIFIED")) {
          const parts = res.error.split(":");
          const encoded = parts[1] || encodeURIComponent(email);
          const rawEmail = decodeURIComponent(encoded);
          setUnverifiedEmail(rawEmail);

          toast.error("E-mail não verificado", {
            description: "Você precisa confirmar seu código de e-mail.",
            action: {
              label: "Verificar Código",
              onClick: () =>
                router.push(
                  `/verify-email?email=${encodeURIComponent(rawEmail)}`
                ),
            },
          });
        } else {
          toast.error("Falha no login", {
            description:
              res.error || "Credenciais inválidas. Verifique seu e-mail e senha.",
          });
        }
        setLoading(false);
        return;
      }

      toast.dismiss(toastId);
      toast.success("Bem-vindo de volta ao GymClub!", {
        description: "Carregando seus treinos e métricas...",
      });

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 700);
    } catch {
      toast.dismiss(toastId);
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao servidor de login.",
      });
      setLoading(false);
    }
  };

  return (
    <AuthWireframeEffect>
      {(isConstructed) => (
        <div className="w-full h-full min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-12 bg-white overflow-x-hidden lg:overflow-hidden font-sans">
          {/* ========================================================= */}
          {/* 1. PAINEL ESQUERDO: CARD VERDE ESMERALDA GYMCLUB HERO */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 h-full p-3 sm:p-5 lg:p-6 flex flex-col justify-between">
            <div className="relative w-full h-full rounded-[28px] lg:rounded-[36px] bg-gradient-to-br from-[#0C3826] via-[#047857] to-[#10B981] p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden shadow-2xl text-white">
              {/* Contorno SVG de Linhas Construindo o Card com Traço Neon Lime */}
              <svg
                className={`pointer-events-none absolute inset-0 w-full h-full z-30 transition-opacity duration-700 ${
                  isConstructed ? "opacity-0" : "opacity-100"
                }`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="2"
                  width="calc(100% - 4px)"
                  height="calc(100% - 4px)"
                  rx="34"
                  fill="none"
                  stroke="#D2FB4C"
                  strokeWidth="2"
                  className="animate-svg-stroke"
                />
              </svg>

              {/* Imagem Pública de Treino com Efeito de Materialização */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                  isConstructed ? "opacity-25" : "opacity-0"
                }`}
              >
                <Image
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop"
                  alt="GymClub Training Session"
                  fill
                  priority
                  className="object-cover mix-blend-overlay"
                />
              </div>

              {/* Auras de Luz Luminous */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D2FB4C]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#064E3B]/60 blur-3xl" />

              {/* Topo do Painel: Logo, Voltar e Badge */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <GymClubLogo size="sm" variant="dark" href="/" />

                  <div className="flex items-center gap-2">
                    <Link
                      href="/"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-colors"
                    >
                      <ArrowLeft size={13} />
                      <span>Voltar</span>
                    </Link>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-sm font-sans">
                      <span>Welcome Back 👋</span>
                    </div>
                  </div>
                </div>

                {/* Headline Monumental */}
                <div className="pt-6 sm:pt-10 lg:pt-14 space-y-3">
                  <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                    Resume your Journey
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-md leading-relaxed">
                    Acesse suas rotinas semanais, registre a evolução de carga dos exercícios compostos e continue evoluindo com o Coach IA.
                  </p>
                </div>
              </div>

              {/* Rodapé do Painel: 3 Stepper Cards Exatos da Referência */}
              <div className="relative z-10 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Passo 1 (Ativo: Card Branco) */}
                <div className="bg-white text-[#1E2022] rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 transform hover:-translate-y-0.5 transition-transform">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#059669] text-white font-mono font-black text-xs shadow-md">
                    1
                  </div>
                  <div>
                    <div className="font-extended text-xs font-bold leading-tight">
                      Acesse sua conta
                    </div>
                    <div className="text-[10px] text-[#8E9296] leading-tight mt-0.5">
                      Login seguro
                    </div>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl p-4 border border-white/20 flex flex-col justify-between space-y-3 transform hover:-translate-y-0.5 transition-transform">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white font-mono font-black text-xs border border-white/30">
                    2
                  </div>
                  <div>
                    <div className="font-extended text-xs font-bold leading-tight">
                      Carregue o treino
                    </div>
                    <div className="text-[10px] text-emerald-100/70 leading-tight mt-0.5">
                      Fichas A, B, C & Cargas
                    </div>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl p-4 border border-white/20 flex flex-col justify-between space-y-3 transform hover:-translate-y-0.5 transition-transform">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white font-mono font-black text-xs border border-white/30">
                    3
                  </div>
                  <div>
                    <div className="font-extended text-xs font-bold leading-tight">
                      Evolua com IA
                    </div>
                    <div className="text-[10px] text-emerald-100/70 leading-tight mt-0.5">
                      Sobrecarga & Volume
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. PAINEL DIREITO: FORMULÁRIO STUDIO CENTRALIZADO EM 100VH */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 h-full flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto bg-white">
            <div className="max-w-md w-full space-y-6">
              {/* Notificação de E-mail Verificado */}
              {verifiedNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>E-mail verificado com sucesso! Digite sua senha para entrar.</span>
                </div>
              )}

              {/* Aviso de E-mail Não Verificado */}
              {unverifiedEmail && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>Conta pendente de ativação</span>
                  </div>
                  <p className="text-[11px] leading-tight text-amber-700">
                    Seu e-mail ainda não foi confirmado com o código de 6 dígitos.
                  </p>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="inline-block font-bold text-[#059669] hover:underline text-[11px]"
                  >
                    Clique aqui para verificar agora &rarr;
                  </Link>
                </div>
              )}

              {/* Cabeçalho do Form */}
              <div className="text-center sm:text-left space-y-1">
                <h2 className="font-extended text-3xl sm:text-4xl font-black text-[#1E2022] tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-[#8E9296] font-medium">
                  Digite seu e-mail e senha para acessar a plataforma
                </p>
              </div>

              {/* Formulário com Efeito de Linhas nos Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* E-mail */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E2022] flex items-center justify-between">
                    <span>E-mail de Acesso</span>
                    {isValidEmail && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-mono">
                        <Check size={12} strokeWidth={3} /> Válido
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9296]"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-xs sm:text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none transition-all ${
                        !isConstructed
                          ? "border-emerald-300 bg-emerald-50/20"
                          : fieldErrors.email
                          ? "border-rose-500 bg-rose-50/50"
                          : "border-black/10 bg-[#F7F6F2] focus:border-[#059669] focus:bg-white"
                      }`}
                    />
                    {isValidEmail && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E2022]">
                      Senha
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-[#059669] font-bold hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9296]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-xs sm:text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none transition-all ${
                        !isConstructed
                          ? "border-emerald-300 bg-emerald-50/20"
                          : fieldErrors.password
                          ? "border-rose-500 bg-rose-50/50"
                          : "border-black/10 bg-[#F7F6F2] focus:border-[#059669] focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9296] hover:text-[#1E2022] transition-colors"
                      title={showPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Botão de Ação Primário (Continue Verde Esmeralda) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-extended font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Link Alternativo para Cadastro */}
              <div className="text-center text-xs text-[#8E9296] pt-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#059669] hover:underline"
                >
                  Sign up
                </Link>
              </div>

              {/* Disclaimer de Privacidade e Termos */}
              <p className="text-[10px] text-center text-[#8E9296] leading-tight pt-2">
                By signing in, you confirm that you agree to the GymClub{" "}
                <Link href="#" className="underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthWireframeEffect>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex flex-col items-center justify-center text-center">
          <Loader2 size={32} className="animate-spin text-[#059669]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#8E9296]">
            Carregando login seguro...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
