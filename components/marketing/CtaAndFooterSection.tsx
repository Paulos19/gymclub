"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Send,
  Globe,
  Lock,
  ChevronUp,
  Activity,
  Heart,
  Award,
} from "lucide-react";
import gsap from "gsap";
import GymClubLogo from "@/components/ui/GymClubLogo";

export default function CtaAndFooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Animação HUD de Linhas se Formando antes de Revelar o Conteúdo (Como na Hero)
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasDrawn) {
            setHasDrawn(true);

            const drawLines = sectionRef.current?.querySelectorAll<
              SVGPathElement | SVGRectElement | SVGLineElement
            >(".hud-draw-line-footer");

            if (drawLines) {
              drawLines.forEach((p) => {
                try {
                  const len = (p as SVGPathElement).getTotalLength
                    ? (p as SVGPathElement).getTotalLength()
                    : 2400;
                  p.style.strokeDasharray = `${len}`;
                  p.style.strokeDashoffset = `${len}`;
                } catch {
                  p.style.strokeDasharray = "2400";
                  p.style.strokeDashoffset = "2400";
                }
              });

              const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

              // 1. As linhas do perímetro e das células bento se desenham
              tl.to(".hud-draw-line-footer", {
                strokeDashoffset: 0,
                duration: 1.35,
                stagger: 0.05,
              });

              // 2. Ao conectar, solidificam os contornos na cor da moldura (#1E2022)
              tl.to(
                ".hud-draw-line-footer",
                {
                  stroke: "#1E2022",
                  duration: 0.25,
                },
                "-=0.2"
              );

              // 3. O preenchimento dos blocos surge
              tl.to(
                ".hud-fill-footer",
                {
                  opacity: 1,
                  duration: 0.35,
                  ease: "power1.out",
                },
                "-=0.2"
              );

              // 4. Elementos internos surgem em cascata (stagger)
              tl.fromTo(
                ".hud-footer-elem",
                { opacity: 0, y: 22 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.55,
                  stagger: 0.04,
                  ease: "power3.out",
                },
                "-=0.1"
              );
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasDrawn]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmailInput("");
    }, 2000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      id="cta-footer-section"
      ref={sectionRef}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
        position: "relative",
        marginTop: 18,
      }}
    >
      {/* ========================================================
          1. CARD DE CONSIDERAÇÕES FINAIS & CHAMADA PARA AÇÃO (CTA)
          (CARD MODULAR 100% LARGURA COM BORDAS HUD DESENHADAS)
          ======================================================== */}
      <div
        style={{
          width: "100%",
          minHeight: 520,
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#1E2022",
          boxSizing: "border-box",
          padding: "clamp(28px, 4.5vw, 68px) clamp(16px, 3.5vw, 56px)",
        }}
      >
        {/* SVG Frame de Linhas Desenhadas no Scroll */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <rect
            className="hud-fill-footer"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            fill="#1E2022"
            style={{ opacity: 0 }}
          />
          <rect
            className="hud-draw-line-footer"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            stroke="#D2FB4C"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Gradiente sutil de iluminação de fundo */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "70%",
            background:
              "radial-gradient(ellipse at center, rgba(210, 251, 76, 0.12) 0%, rgba(134, 140, 240, 0.05) 50%, transparent 75%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Conteúdo do CTA & Considerações */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: 1040,
            margin: "0 auto",
            gap: 28,
            width: "100%",
          }}
        >
          {/* Badge de Considerações Finais */}
          <div
            className="hud-footer-elem"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 9999,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "#D2FB4C",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              fontFamily: "var(--font-sans-ui)",
              maxWidth: "100%",
            }}
          >
            <Zap size={14} fill="#D2FB4C" />
            <span style={{ wordBreak: "break-word" }}>CONSIDERAÇÕES FINAIS • CHEGOU A SUA HORA</span>
          </div>

          {/* Headline Display Massiva Estendida 100% Responsiva */}
          <h2
            className="hud-footer-elem font-extended"
            style={{
              fontSize: "clamp(1.5rem, 5.2vw, 4.4rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              color: "#FFFFFF",
              letterSpacing: "-0.035em",
              margin: 0,
              textTransform: "uppercase",
              maxWidth: 920,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
            }}
          >
            PRONTO PARA TRANSFORMAR SEU TREINO EM CIÊNCIA?
          </h2>

          {/* Subtítulo Convincente */}
          <p
            className="hud-footer-elem"
            style={{
              fontSize: "clamp(0.92rem, 1.35vw, 1.15rem)",
              lineHeight: 1.6,
              color: "#A4A8AD",
              fontFamily: "var(--font-sans-ui)",
              margin: 0,
              maxWidth: 680,
              fontWeight: 500,
            }}
          >
            Pare de depender de anotações perdidas e palpites. O GymClub entrega a
            precisão de atletas de elite para que cada série, quilo e repetição construa o seu
            melhor físico.
          </p>

          {/* Grid com 4 Cartões de Considerações & Garantias */}
          <div
            className="hud-footer-elem"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
              gap: 14,
              width: "100%",
              marginTop: 10,
            }}
          >
            {[
              {
                icon: Lock,
                title: "Privacidade Criptografada",
                desc: "Cofre privado com fotos protegidas e visíveis somente para você.",
                tagColor: "#CADBD0",
              },
              {
                icon: TrendingUp,
                title: "Sobrecarga de Precisão",
                desc: "Cálculo de 1RM, volume semanal e projeções automáticas de carga.",
                tagColor: "#D2FB4C",
              },
              {
                icon: Sparkles,
                title: "Coach IA 24 Horas",
                desc: "Periodização inteligente e respostas instantâneas para qualquer dúvida.",
                tagColor: "#868CF0",
              },
              {
                icon: ShieldCheck,
                title: "Zero Fidelidade",
                desc: "Comece gratuitamente em menos de 1 minuto. Cancele quando quiser.",
                tagColor: "#D2FB4C",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 18,
                    padding: "20px 18px",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.borderColor = card.tagColor;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.tagColor,
                    }}
                  >
                    <Icon size={18} strokeWidth={2.4} />
                  </div>
                  <div
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#8B9096",
                      lineHeight: 1.45,
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ações Centrais do CTA */}
          <div
            className="hud-footer-elem"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 14,
            }}
          >
            {/* Botão Primário Fluorescente */}
            <Link
              href="/register"
              className="glow-lime"
              style={{
                padding: "18px 36px",
                borderRadius: 9999,
                backgroundColor: "#D2FB4C",
                color: "#1E2022",
                fontWeight: 900,
                fontSize: "1rem",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans-ui)",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 8px 30px rgba(210, 251, 76, 0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>CRIAR CONTA GRATUITA AGORA</span>
              <ArrowUpRight size={22} strokeWidth={3} />
            </Link>

            {/* Botão Secundário de Exploração */}
            <Link
              href="/workouts"
              style={{
                padding: "18px 32px",
                borderRadius: 9999,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans-ui)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.borderColor = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              <span>VER DEMO DA PLATAFORMA</span>
            </Link>
          </div>

          {/* Selos de Confiança no Rodapé do CTA */}
          <div
            className="hud-footer-elem"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 20,
              fontSize: "0.8rem",
              color: "#7E8388",
              fontFamily: "var(--font-sans-ui)",
              fontWeight: 600,
              paddingTop: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={15} color="#D2FB4C" />
              <span>Sem cartão de crédito necessário</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={15} color="#D2FB4C" />
              <span>Compatível com iOS, Android e Web</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={15} color="#D2FB4C" />
              <span>Exportação de treinos em 1 clique</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. PODEROSO BENTO GRID FOOTER
          (ESTRUTURA MODULAR COM BORDAS HUD DESENHADAS, LINKS & NEWSLETTER)
          ======================================================== */}
      <div
        style={{
          width: "100%",
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#16181A",
          border: "2.5px solid #1E2022",
          boxSizing: "border-box",
          padding: "clamp(26px, 4.5vw, 56px) clamp(16px, 3.5vw, 48px) 26px clamp(16px, 3.5vw, 48px)",
        }}
      >
        {/* SVG Frame de Linhas Desenhadas no Bento Footer */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <rect
            className="hud-fill-footer"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            fill="#16181A"
            style={{ opacity: 0 }}
          />
          <rect
            className="hud-draw-line-footer"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            stroke="#868CF0"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* ========================================================
            GRADE PRINCIPAL BENTO MODULAR DO FOOTER (100% RESPONSIVA)
            ======================================================== */}
        <div
          className="hud-footer-elem"
          style={{
            position: "relative",
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "clamp(24px, 3.5vw, 40px)",
            alignItems: "start",
            paddingBottom: 40,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* ----------------------------------------------------
              CÉLULA BENTO 1: BRAND MANIFESTO & LIVE STATUS
              ---------------------------------------------------- */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Logo Oficial GymClub Idêntico à Navbar (Sem Lucide Icons) */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <GymClubLogo href="/" variant="dark" size="lg" />
            </div>

            {/* Manifesto de Marca */}
            <p
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.6,
                color: "#8E9399",
                fontFamily: "var(--font-sans-ui)",
                margin: 0,
                maxWidth: 340,
              }}
            >
              O ecossistema construído por atletas para atletas. Rastreamento
              implacável de sobrecarga, histórico fotográfico e periodização com IA
              para quem não aceita o platô.
            </p>

            {/* Live Operational Status Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 9999,
                backgroundColor: "rgba(210, 251, 76, 0.06)",
                border: "1px solid rgba(210, 251, 76, 0.2)",
                fontSize: "0.75rem",
                color: "#D2FB4C",
                fontWeight: 700,
                fontFamily: "var(--font-sans-ui)",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#D2FB4C",
                  boxShadow: "0 0 8px #D2FB4C",
                  animation: "pulse 2s infinite",
                }}
              />
              <span>SISTEMA 100% OPERACIONAL • v2.4 (PROD)</span>
            </div>
          </div>

          {/* ----------------------------------------------------
              CÉLULA BENTO 2: NEWSLETTER DE ALTA PERFORMANCE
              ---------------------------------------------------- */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 20,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "#D2FB4C",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "var(--font-sans-ui)",
                  marginBottom: 6,
                }}
              >
                REPORT SEMANAL
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontFamily: "var(--font-extended)",
                }}
              >
                CIÊNCIA DA HIPERTROFIA
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#7E8388",
                  lineHeight: 1.45,
                  marginTop: 6,
                  fontFamily: "var(--font-sans-ui)",
                }}
              >
                Receba estudos de hipertrofia, sugestões de treinos e novidades do app direto na sua caixa.
              </p>
            </div>

            {/* Formulário Interativo Responsivo */}
            <form onSubmit={handleSubscribe} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.melhor.email@exemplo.com"
                required
                style={{
                  flex: "1 1 180px",
                  minWidth: 0,
                  padding: "12px 16px",
                  borderRadius: 12,
                  backgroundColor: "#1E2022",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  outline: "none",
                  fontFamily: "var(--font-sans-ui)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  backgroundColor: subscribed ? "#CADBD0" : "#D2FB4C",
                  color: "#1E2022",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {subscribed ? (
                  <span>Pronto!</span>
                ) : (
                  <>
                    <span>Assinar</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ----------------------------------------------------
              CÉLULA BENTO 3: NAVEGAÇÃO RÁPIDA DO ECOSSISTEMA
              ---------------------------------------------------- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            {/* Coluna 1: Plataforma */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "var(--font-sans-ui)",
                }}
              >
                PLATAFORMA
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: "0.84rem",
                  fontFamily: "var(--font-sans-ui)",
                  color: "#8B9096",
                }}
              >
                <li>
                  <Link
                    href="/workouts"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Diário de Treinos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workouts"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Sobrecarga Progressiva
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Cofre de Fotos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-coach"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Coach IA Personalizado
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 2: Comunidade & Legal */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "var(--font-sans-ui)",
                }}
              >
                COMUNIDADE
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: "0.84rem",
                  fontFamily: "var(--font-sans-ui)",
                  color: "#8B9096",
                }}
              >
                <li>
                  <Link
                    href="/ai-coach"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Blog de Performance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workouts"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Treinadores Credenciados
                  </Link>
                </li>
                <li>
                  <Link
                    href="#app-info"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Termos & Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#D2FB4C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9096")}
                  >
                    Área do Atleta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================
            BARRA INFERIOR DE COPYRIGHT, REDES & RETORNO AO TOPO
            ======================================================== */}
        <div
          className="hud-footer-elem"
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
            paddingTop: 28,
          }}
        >
          {/* Copyright & Direitos */}
          <div
            style={{
              fontSize: "0.78rem",
              color: "#6E7277",
              fontFamily: "var(--font-sans-ui)",
            }}
          >
            © 2026 GymClub Inc. Todos os direitos reservados. Feito para alta performance.
          </div>

          {/* Redes Sociais Circulares */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {[
              { label: "yt", title: "YouTube" },
              { label: "ig", title: "Instagram" },
              { label: "fb", title: "Facebook" },
              { label: "x", title: "X (Twitter)" },
            ].map((s, i) => (
              <div
                key={i}
                title={s.title}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "#FFFFFF",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D2FB4C";
                  e.currentTarget.style.color = "#1E2022";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {s.label}
              </div>
            ))}
          </div>

          {/* Botão de Retorno ao Topo Suave */}
          <button
            onClick={scrollToTop}
            aria-label="Voltar ao início da página"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 9999,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "var(--font-sans-ui)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E2022";
              e.currentTarget.style.borderColor = "#D2FB4C";
              e.currentTarget.style.color = "#D2FB4C";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>TOPO</span>
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
