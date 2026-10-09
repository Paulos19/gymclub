"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import GymClubLogo from "@/components/ui/GymClubLogo";
import { AuthWireframeEffect } from "@/components/auth/AuthWireframeEffect";
import {
  registerSchema,
  checkPasswordStrength,
  PasswordStrength,
} from "@/lib/validations/auth";
import { toast } from "@/components/ui/sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    targetGoal: "HIPERTROFIA",
    currentWeight: "",
    height: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength: PasswordStrength = checkPasswordStrength(
    formData.password
  );

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const passwordsMatch =
    formData.password.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validação com Zod
    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFieldErrors(errors);

      const firstError = validationResult.error.issues[0]?.message;
      toast.error("Verifique os campos do cadastro", {
        description: firstError || "Preencha todos os dados corretamente.",
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Criando seu passaporte no GymClub...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          targetGoal: formData.targetGoal,
          currentWeight: formData.currentWeight,
          height: formData.height,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.dismiss(toastId);
        toast.error("Falha ao criar conta", {
          description: data.error || "Ocorreu um erro no cadastro.",
        });
        setLoading(false);
        return;
      }

      toast.dismiss(toastId);
      toast.success("Conta criada com sucesso!", {
        description: "Enviamos seu código de verificação por e-mail.",
      });

      // Redireciona para verificação de e-mail
      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email.trim())}`
        );
      }, 900);
    } catch {
      toast.dismiss(toastId);
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao servidor. Tente novamente.",
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
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                  alt="GymClub Training Athlete"
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
                      <span>Join Us to Build 🤝</span>
                    </div>
                  </div>
                </div>

                {/* Headline Monumental */}
                <div className="pt-6 sm:pt-10 lg:pt-14 space-y-3">
                  <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                    Start your Journey
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-md leading-relaxed">
                    Siga estes passos simples para configurar seu passaporte de treino, registrar sobrecargas e calibrar seu Coach IA.
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
                      Crie sua conta
                    </div>
                    <div className="text-[10px] text-[#8E9296] leading-tight mt-0.5">
                      Preencha credenciais
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
                      Calibre o perfil
                    </div>
                    <div className="text-[10px] text-emerald-100/70 leading-tight mt-0.5">
                      Peso, altura e meta
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
                      Cargas e periodização
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
              {/* Cabeçalho do Form */}
              <div className="text-center sm:text-left space-y-1">
                <h2 className="font-extended text-3xl sm:text-4xl font-black text-[#1E2022] tracking-tight">
                  Join Us
                </h2>
                <p className="text-xs text-[#8E9296] font-medium">
                  Crie sua conta para acessar treinos, cargas e fotos privadas
                </p>
              </div>

              {/* Formulário com Efeito de Linhas nos Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome Completo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E2022]">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9296]"
                    />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Carlos Silva"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none transition-all ${
                        !isConstructed
                          ? "border-emerald-300 bg-emerald-50/20"
                          : fieldErrors.name
                          ? "border-rose-500 bg-rose-50/50"
                          : "border-black/10 bg-[#F7F6F2] focus:border-[#059669] focus:bg-white"
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* E-mail com Validação ao Vivo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E2022] flex items-center justify-between">
                    <span>E-mail</span>
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
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
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

                {/* Senha com Força Visual e Eye Toggle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E2022] flex items-center justify-between">
                    <span>Senha de Alta Segurança</span>
                    {formData.password && (
                      <span
                        className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${passwordStrength.color}20`,
                          color: passwordStrength.color,
                        }}
                      >
                        {passwordStrength.label}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9296]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
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

                  {/* Barra de Força da Senha */}
                  {formData.password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden flex gap-1">
                        {[0, 1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className="h-full flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                step < passwordStrength.score
                                  ? passwordStrength.color
                                  : "transparent",
                            }}
                          />
                        ))}
                      </div>

                      <div className="text-[10px] text-[#8E9296] flex flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
                        <span
                          className={
                            passwordStrength.hasMinLength
                              ? "text-emerald-600 font-bold"
                              : ""
                          }
                        >
                          • Mín 8 caracteres
                        </span>
                        <span
                          className={
                            passwordStrength.hasUpper &&
                            passwordStrength.hasLower
                              ? "text-emerald-600 font-bold"
                              : ""
                          }
                        >
                          • Maiúscula & minúscula
                        </span>
                        <span
                          className={
                            passwordStrength.hasNumber
                              ? "text-emerald-600 font-bold"
                              : ""
                          }
                        >
                          • Número
                        </span>
                        <span
                          className={
                            passwordStrength.hasSpecial
                              ? "text-emerald-600 font-bold"
                              : ""
                          }
                        >
                          • Símbolo especial
                        </span>
                      </div>
                    </div>
                  )}

                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E2022] flex items-center justify-between">
                    <span>Confirmar Senha</span>
                    {passwordsMatch && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-mono">
                        <Check size={12} strokeWidth={3} /> Coincidem
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9296]"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 rounded-2xl border text-xs sm:text-sm text-[#1E2022] placeholder-[#8E9296] focus:outline-none transition-all ${
                        !isConstructed
                          ? "border-emerald-300 bg-emerald-50/20"
                          : fieldErrors.confirmPassword
                          ? "border-rose-500 bg-rose-50/50"
                          : "border-black/10 bg-[#F7F6F2] focus:border-[#059669] focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9296] hover:text-[#1E2022] transition-colors"
                      title={
                        showConfirmPassword ? "Ocultar senha" : "Ver senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Objetivo de Treino */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-[#1E2022]">
                    Objetivo Principal
                  </label>
                  <select
                    value={formData.targetGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, targetGoal: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#F7F6F2] text-xs sm:text-sm text-[#1E2022] focus:outline-none focus:border-[#059669] focus:bg-white transition-all font-medium"
                  >
                    <option value="HIPERTROFIA">
                      Hipertrofia (Ganho de Massa Magra)
                    </option>
                    <option value="EMAGRECIMENTO">
                      Emagrecimento & Definição
                    </option>
                    <option value="FORCA">Força & Powerlifting</option>
                    <option value="CONDICIONAMENTO">
                      Condicionamento Geral & Mobilidade
                    </option>
                  </select>
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
                      <span>Criando Passaporte...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Link Alternativo para Login */}
              <div className="text-center text-xs text-[#8E9296] pt-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#059669] hover:underline"
                >
                  Login
                </Link>
              </div>

              {/* Disclaimer de Privacidade e Termos */}
              <p className="text-[10px] text-center text-[#8E9296] leading-tight pt-2">
                By signing up, you confirm that you agree to the GymClub{" "}
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
