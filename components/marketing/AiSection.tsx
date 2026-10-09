"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUp,
  Loader2,
  Copy,
  Check,
  Dumbbell,
  Flame,
  TrendingUp,
  Clock,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import gsap from "gsap";

const SUGGESTIONS = [
  { label: "Monte meu treino de hoje", icon: Flame },
  { label: "Como progredir carga no supino?", icon: TrendingUp },
  { label: "Qual a divisão ideal para 4 dias?", icon: Dumbbell },
  { label: "Quanto descansar entre as séries?", icon: Clock },
];

export default function AiSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const responseCardRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [copied, setCopied] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Animação de Linhas de Traçado ao Rolar até a Seção
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasDrawn) {
            setHasDrawn(true);

            const drawLines = sectionRef.current?.querySelectorAll<
              SVGPathElement | SVGRectElement
            >(".hud-draw-line-ai");

            if (drawLines) {
              drawLines.forEach((p) => {
                try {
                  const len = (p as SVGPathElement).getTotalLength
                    ? (p as SVGPathElement).getTotalLength()
                    : 2000;
                  p.style.strokeDasharray = `${len}`;
                  p.style.strokeDashoffset = `${len}`;
                } catch {
                  p.style.strokeDasharray = "2000";
                  p.style.strokeDashoffset = "2000";
                }
              });

              const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

              tl.to(".hud-draw-line-ai", {
                strokeDashoffset: 0,
                duration: 1.2,
                stagger: 0.08,
              });

              tl.to(
                ".hud-draw-line-ai",
                {
                  stroke: "#1E2022",
                  duration: 0.25,
                },
                "-=0.2"
              );

              tl.to(
                ".hud-fill-ai",
                {
                  opacity: 1,
                  duration: 0.35,
                  ease: "power1.out",
                },
                "-=0.2"
              );

              tl.fromTo(
                ".hud-ai-elem",
                { opacity: 0, y: 16 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  stagger: 0.04,
                  ease: "power3.out",
                },
                "-=0.1"
              );
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasDrawn]);

  // Envio de Pergunta para a API
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInputMessage("");
    setLoading(true);

    // Adiciona a mensagem do usuário na conversa
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Desculpe, o servidor do treinador está ocupado no momento. Tente novamente em instantes.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Não foi possível obter resposta no momento. Por favor, tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
      // Rola suavemente até a resposta
      setTimeout(() => {
        responseCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  };

  const handleCopyLastResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="ai-coach-section"
      ref={sectionRef}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box",
        position: "relative",
        marginTop: 16,
      }}
    >
      {/* ========================================================
          CARD PRINCIPAL DA SEÇÃO IA (LARGURA TOTAL COM MOLDURA #1E2022)
          Inspirado na referência Dia: Fundo luminoso pastel, tipografia clean e prompt flutuante
          ======================================================== */}
      <div
        style={{
          width: "100%",
          minHeight: 620,
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxSizing: "border-box",
          padding: "clamp(26px, 4.5vw, 64px) clamp(16px, 3.5vw, 48px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* SVG Frame de Linhas Desenhadas e Preenchimento */}
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
            className="hud-fill-ai"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            fill="#FFFFFF"
            style={{ opacity: 0 }}
          />
          <rect
            className="hud-draw-line-ai"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            stroke="#CADBD0"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Efeito Atmosférico Eclético de Fundo (Auras radiais suaves em pastel menta e pêssego) */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(202, 219, 208, 0.45) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -100,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(210, 251, 76, 0.25) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -40,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(134, 140, 240, 0.18) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* ========================================================
            CONTEÚDO HERO DA IA: LOGO PILL, TÍTULO E BOTÃO DUPLO
            ======================================================== */}
        <div
          className="hud-ai-elem"
          style={{
            position: "relative",
            zIndex: 4,
            textAlign: "center",
            maxWidth: 780,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Logo Pill Superior Estilizado */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 9999,
              backgroundColor: "#1E2022",
              color: "#FFFFFF",
              fontSize: "0.82rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              fontFamily: "var(--font-sans-ui)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Sparkles size={15} color="#D2FB4C" />
            <span>GYMCLUB AI</span>
          </div>

          {/* Título Principal Display Estendido 100% Responsivo */}
          <h2
            className="font-extended"
            style={{
              fontSize: "clamp(1.6rem, 5.2vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#1E2022",
              letterSpacing: "-0.04em",
              margin: 0,
              textTransform: "uppercase",
              wordBreak: "break-word",
            }}
          >
            Converse com seu Treinador IA
          </h2>

          {/* Botão Pílula Bipartido (Inspirado no Dia: Early access / Download) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#F2F4F2",
              border: "1.5px solid rgba(30, 32, 34, 0.12)",
              borderRadius: 9999,
              padding: "4px 4px 4px 16px",
              gap: 12,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "#1E2022",
                fontWeight: 700,
                fontFamily: "var(--font-sans-ui)",
              }}
            >
              Inteligência Esportiva 24/7
            </span>

            <Link
              href="/register"
              style={{
                backgroundColor: "#1E2022",
                color: "#FFFFFF",
                padding: "8px 18px",
                borderRadius: 9999,
                fontSize: "0.78rem",
                fontWeight: 800,
                fontFamily: "var(--font-sans-ui)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D2FB4C";
                e.currentTarget.style.color = "#1E2022";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1E2022";
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              <span>Acessar Grátis</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "#6E7277",
              fontFamily: "var(--font-sans-ui)",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Faça perguntas sobre hipertrofia, periodização de carga e nutrição esportiva.
          </p>
        </div>

        {/* ========================================================
            MOCKUP DE JANELA DE NAVEGADOR & PROMPT FLUTUANTE
            (O Elemento Central da Referência)
            ======================================================== */}
        <div
          className="hud-ai-elem"
          style={{
            position: "relative",
            zIndex: 4,
            width: "100%",
            maxWidth: 760,
            marginTop: 32,
            boxSizing: "border-box",
          }}
        >
          {/* Moldura de Fundo estilo Browser Window (com os 3 botões o o o) */}
          <div
            className="hidden sm:flex"
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: 24,
              border: "1.5px solid rgba(30, 32, 34, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(12px)",
              pointerEvents: "none",
              zIndex: 1,
              flexDirection: "column",
              padding: "12px 16px",
            }}
          >
            {/* Window Controls (o o o) */}
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FF5F56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#27C93F" }} />
            </div>
          </div>

          {/* INPUT BAR FLUTUANTE (Fiel à referência Dia com sombra suave e borda limpa) */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              backgroundColor: "#FFFFFF",
              border: "2px solid #1E2022",
              borderRadius: 22,
              padding: "16px 20px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Linha de Entrada: Ícone de Busca + Input + Botão Enviar */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Sparkles size={20} color="#1E2022" style={{ flexShrink: 0 }} />

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Pergunte ao Treinador IA... (ex: Como progredir carga no supino?)"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)",
                  fontFamily: "var(--font-sans-ui)",
                  fontWeight: 600,
                  color: "#1E2022",
                  backgroundColor: "transparent",
                }}
              />

              {/* Botão de Envio Circular com Seta para Cima (↑) */}
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                aria-label="Enviar Pergunta"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: inputMessage.trim() ? "#D2FB4C" : "#1E2022",
                  color: inputMessage.trim() ? "#1E2022" : "#FFFFFF",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: inputMessage.trim() && !loading ? "pointer" : "default",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: inputMessage.trim()
                    ? "0 4px 14px rgba(210, 251, 76, 0.6)"
                    : "none",
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowUp size={20} strokeWidth={2.8} />
                )}
              </button>
            </div>

            {/* Chips de Sugestões Rápidas (Inspirado no + Add tabs or files do Dia) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 4,
                borderTop: "1px solid rgba(30, 32, 34, 0.06)",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#8E9296",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans-ui)",
                  textTransform: "uppercase",
                  marginRight: 4,
                }}
              >
                Sugestões:
              </span>

              {SUGGESTIONS.map((sug, i) => {
                const Icon = sug.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug.label)}
                    disabled={loading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#F2F4F2",
                      border: "1px solid rgba(30, 32, 34, 0.08)",
                      borderRadius: 9999,
                      padding: "5px 12px",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: "#1E2022",
                      fontFamily: "var(--font-sans-ui)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#E8ECE9";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F2F4F2";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Icon size={12} color="#1E2022" />
                    <span>{sug.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              BALÃO DE RESPOSTA EXPANSÍVEL DA IA (RESPOSTA EM TEMPO REAL)
              ======================================================== */}
          {(loading || messages.length > 0) && (
            <div
              ref={responseCardRef}
              style={{
                marginTop: 18,
                backgroundColor: "#1E2022",
                color: "#FFFFFF",
                borderRadius: 22,
                padding: "24px",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                animation: "fadeIn 0.3s ease-out forwards",
              }}
            >
              {/* Header do Balão de Resposta */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "#D2FB4C",
                      color: "#1E2022",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  >
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#FFFFFF" }}>
                      GymClub Coach AI
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#D2FB4C",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      ● Especialista em Biomecânica & Carga
                    </div>
                  </div>
                </div>

                {messages.length > 0 && !loading && (
                  <button
                    onClick={() =>
                      handleCopyLastResponse(
                        messages[messages.length - 1]?.content || ""
                      )
                    }
                    title="Copiar Resposta"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} color="#D2FB4C" />
                        <span style={{ color: "#D2FB4C" }}>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Conteúdo da Resposta com Formatação */}
              <div
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  color: "rgba(255, 255, 255, 0.92)",
                  fontFamily: "var(--font-sans-ui)",
                  maxHeight: 360,
                  overflowY: "auto",
                  paddingRight: 6,
                  whiteSpace: "pre-line",
                }}
              >
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "rgba(255, 255, 255, 0.7)",
                      padding: "16px 0",
                    }}
                  >
                    <Loader2 size={20} className="animate-spin" color="#D2FB4C" />
                    <span>O Treinador IA está analisando sua pergunta e calculando a resposta...</span>
                  </div>
                ) : (
                  messages[messages.length - 1]?.content
                )}
              </div>

              {/* Ações pós-resposta */}
              {!loading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingTop: 14,
                  }}
                >
                  <button
                    onClick={() => {
                      setMessages([]);
                      setInputMessage("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Nova pergunta</span>
                  </button>

                  <Link
                    href="/register"
                    className="glow-lime"
                    style={{
                      backgroundColor: "#D2FB4C",
                      color: "#1E2022",
                      padding: "8px 18px",
                      borderRadius: 9999,
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-sans-ui)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    <span>Salvar no Meu App</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            RODAPÉ INFERIOR (PÍLULA DE VÍDEO / DEMO - INSPIRADA NO WATCH TRAILER)
            ======================================================== */}
        <div
          className="hud-ai-elem"
          style={{
            position: "relative",
            zIndex: 4,
            marginTop: 36,
          }}
        >
          <Link
            href="/workouts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "rgba(30, 32, 34, 0.05)",
              border: "1.5px solid rgba(30, 32, 34, 0.12)",
              borderRadius: 9999,
              padding: "8px 20px",
              color: "#1E2022",
              fontSize: "0.82rem",
              fontWeight: 800,
              fontFamily: "var(--font-sans-ui)",
              transition: "transform 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E2022";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 32, 34, 0.05)";
              e.currentTarget.style.color = "#1E2022";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span>Ver como o Coach IA integra com seu Diário de Cargas</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
