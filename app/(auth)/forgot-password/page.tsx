"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Reutiliza endpoint de envio
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar solicitação.");
      } else {
        setSuccess(
          "Se este e-mail estiver cadastrado, enviamos as instruções de recuperação."
        );
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Recuperar Senha
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Insira seu e-mail cadastrado para enviarmos instruções de acesso
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

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label" htmlFor="forgot-email">
            E-mail
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            />
            <input
              id="forgot-email"
              type="email"
              required
              placeholder="seuemail@exemplo.com"
              className="form-input"
              style={{ paddingLeft: 42 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar Instruções
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: 28,
          textAlign: "center",
          fontSize: "0.88rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 20,
        }}
      >
        Lembrou da senha?{" "}
        <Link
          href="/login"
          style={{ color: "var(--amber-light)", fontWeight: 700 }}
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
