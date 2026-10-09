"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código inválido ou expirado.");
        setLoading(false);
        return;
      }

      setSuccess("E-mail verificado com sucesso! Redirecionando para o login...");
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 1500);
    } catch {
      setError("Erro ao verificar código. Tente novamente.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setError(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível reenviar o código.");
      } else {
        setSuccess("Novo código enviado para sua caixa de entrada!");
        setCooldown(60); // 60 segundos de cooldown
      }
    } catch {
      setError("Erro ao reenviar código. Verifique sua conexão.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--amber-light)",
            marginBottom: 16,
          }}
        >
          <MailCheck size={28} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Verificação de E-mail
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Insira o código de 6 dígitos que enviamos para o seu e-mail via Nodemailer
        </p>
      </div>

      {success && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--emerald-light)",
            fontSize: "0.88rem",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#f87171",
            fontSize: "0.88rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label className="form-label" htmlFor="verify-email">
            Seu E-mail
          </label>
          <input
            id="verify-email"
            type="email"
            required
            placeholder="seuemail@exemplo.com"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label" htmlFor="verify-code">
            Código de 6 Dígitos
          </label>
          <input
            id="verify-code"
            type="text"
            required
            maxLength={6}
            placeholder="000000"
            className="form-input"
            style={{
              textAlign: "center",
              letterSpacing: "8px",
              fontSize: "1.4rem",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "var(--amber-light)",
            }}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Validando código...
            </>
          ) : (
            <>
              Confirmar e Ativar Conta
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Resend Action */}
      <div
        style={{
          marginTop: 24,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0 || !email}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", padding: "8px 16px" }}
        >
          {resending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Reenviando...
            </>
          ) : cooldown > 0 ? (
            `Reenviar código em ${cooldown}s`
          ) : (
            <>
              <RefreshCw size={14} />
              Reenviar código por e-mail
            </>
          )}
        </button>

        <Link
          href="/login"
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            textDecoration: "underline",
          }}
        >
          Voltar para tela de login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          Carregando verificação...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
