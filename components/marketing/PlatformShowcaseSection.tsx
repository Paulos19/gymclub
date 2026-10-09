"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import gsap from "gsap";

export default function PlatformShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Dimensões medidas do Card Amarelo para cálculo exato dos cantos côncavos (fillets)
  const [cardSize, setCardSize] = useState({ width: 560, height: 540 });

  useEffect(() => {
    if (!cardContainerRef.current) return;
    const updateSize = () => {
      if (cardContainerRef.current) {
        const { clientWidth, clientHeight } = cardContainerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setCardSize({ width: clientWidth, height: clientHeight });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(cardContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Animação GSAP de Wireframe HUD ao scrollar até a seção
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasDrawn) {
            setHasDrawn(true);

            const drawLines = sectionRef.current?.querySelectorAll<
              SVGPathElement | SVGRectElement
            >(".hud-draw-line-showcase");

            if (drawLines) {
              drawLines.forEach((p) => {
                try {
                  const len = (p as SVGPathElement).getTotalLength
                    ? (p as SVGPathElement).getTotalLength()
                    : 2200;
                  p.style.strokeDasharray = `${len}`;
                  p.style.strokeDashoffset = `${len}`;
                } catch {
                  p.style.strokeDasharray = "2200";
                  p.style.strokeDashoffset = "2200";
                }
              });

              const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

              tl.to(".hud-draw-line-showcase", {
                strokeDashoffset: 0,
                duration: 1.25,
                stagger: 0.08,
              });

              tl.to(
                ".hud-draw-line-showcase",
                {
                  stroke: "#1E2022",
                  duration: 0.25,
                },
                "-=0.2"
              );

              tl.to(
                ".hud-fill-showcase",
                {
                  opacity: 1,
                  duration: 0.35,
                  ease: "power1.out",
                },
                "-=0.2"
              );

              tl.fromTo(
                ".hud-showcase-elem",
                { opacity: 0, y: 18 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.55,
                  stagger: 0.05,
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

  // ==========================================================
  // GEOMETRIA VETORIAL DO CARD AMARELO / ÂMBAR
  // (Notch superior direito para o Globo + Notch lateral esquerdo para as 3 abas)
  // ==========================================================
  const W = cardSize.width;
  const H = cardSize.height;

  // Responsividade de parâmetros vetoriais para telas estreitas
  const isMobile = W < 600;

  // Raio dos cantos externos do card
  const R = isMobile ? 22 : 32;

  // Dimensões do Notch Superior Direito (Recorte do Globo)
  const nw = isMobile ? 54 : 68;
  const nh = isMobile ? 54 : 68;
  const rf = isMobile ? 14 : 18;

  // Dimensões do Notch Lateral Esquerdo (Baía côncava das 3 pílulas circulares)
  const bayTop = Math.round(H * 0.44);
  const bayBottom = Math.round(H * 0.82);
  const bayIndent = isMobile ? 24 : 34;
  const bayFillet = isMobile ? 12 : 16;

  // Path SVG com beziers quadráticos contínuos (tangentes perfeitas sem quinas)
  const yellowCardPath = `
    M ${R} 0
    L ${Math.max(R, W - nw - rf)} 0
    Q ${W - nw} 0, ${W - nw} ${rf}
    L ${W - nw} ${nh - rf}
    Q ${W - nw} ${nh}, ${W - nw + rf} ${nh}
    L ${W - rf} ${nh}
    Q ${W} ${nh}, ${W} ${nh + rf}
    L ${W} ${H - R}
    Q ${W} ${H}, ${W - R} ${H}
    L ${R} ${H}
    Q 0 ${H}, 0 ${H - R}
    L 0 ${bayBottom + bayFillet}
    Q 0 ${bayBottom}, ${bayFillet} ${bayBottom}
    L ${bayIndent - bayFillet} ${bayBottom}
    Q ${bayIndent} ${bayBottom}, ${bayIndent} ${bayBottom - bayFillet}
    L ${bayIndent} ${bayTop + bayFillet}
    Q ${bayIndent} ${bayTop}, ${bayIndent - bayFillet} ${bayTop}
    L ${bayFillet} ${bayTop}
    Q 0 ${bayTop}, 0 ${bayTop - bayFillet}
    L 0 ${R}
    Q 0 0, ${R} 0
    Z
  `;

  return (
    <section
      id="platform-showcase-section"
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
          CARD CONTAINER PRINCIPAL (LARGURA TOTAL 100% COM MOLDURA #1E2022)
          ======================================================== */}
      <div
        style={{
          width: "100%",
          minHeight: 620,
          borderRadius: 28,
          position: "relative",
          backgroundColor: "#FFFFFF",
          boxSizing: "border-box",
          padding: "clamp(26px, 4.5vw, 64px) clamp(16px, 3.5vw, 54px)",
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
            className="hud-fill-showcase"
            x="1.5"
            y="1.5"
            width="calc(100% - 3px)"
            height="calc(100% - 3px)"
            rx="28"
            fill="#FFFFFF"
            style={{ opacity: 0 }}
          />
          <rect
            className="hud-draw-line-showcase"
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

        {/* ========================================================
            GRADE DE CONTEÚDO (ESQUERDA: TEXTO EDITORIAL | DIREITA: CARD ÂMBAR)
            ======================================================== */}
        <div
          className="platform-showcase-grid"
          style={{
            position: "relative",
            zIndex: 3,
            display: "grid",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* --------------------------------------------------------
              LADO ESQUERDO: TYPOGRAPHY EDITORIAL ("visual poetry" STYLE),
              PARÁGRAFO, BOTÕES SOCIAIS CIRCULARES & MÉTRICAS DE IMPACTO
              -------------------------------------------------------- */}
          <div
            className="hud-showcase-elem"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* Tag Superior Discreta */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.78rem",
                fontWeight: 800,
                color: "#7E8388",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                fontFamily: "var(--font-sans-ui)",
                maxWidth: "100%",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#D2FB4C",
                  boxShadow: "0 0 10px #D2FB4C",
                  flexShrink: 0,
                }}
              />
              <span>ECOSSISTEMA GYMCLUB • ALTA PERFORMANCE</span>
            </div>

            {/* Headline Principal Inspirada no "visual poetry" da Referência 100% Responsiva */}
            <h2
              className="font-extended"
              style={{
                fontSize: "clamp(2.2rem, 6.5vw, 5.8rem)",
                fontWeight: 900,
                lineHeight: 0.9,
                color: "#1E2022",
                letterSpacing: "-0.04em",
                margin: 0,
                textTransform: "lowercase",
                wordBreak: "break-word",
              }}
            >
              <div>evolução</div>
              <div>real</div>
            </h2>

            {/* Parágrafo Descritivo Explicando o que a Plataforma Entrega */}
            <p
              style={{
                fontSize: "clamp(0.95rem, 1.35vw, 1.08rem)",
                lineHeight: 1.6,
                color: "#4A4D52",
                fontFamily: "var(--font-sans-ui)",
                margin: 0,
                maxWidth: 460,
                fontWeight: 600,
              }}
            >
              A jornada definitiva para transformar seu físico com consistência e inteligência.
              Monitore sobrecarga progressiva com precisão milimétrica, guarde registros em um cofre
              privado e descubra o poder de dados reais guiando cada repetição.
            </p>

            {/* Botões Circulares Sociais / Módulos (Clonados dos círculos yt, ig, fb, x da referência) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingTop: 4,
              }}
            >
              {[
                { tag: "yt", title: "Canal GymClub YouTube" },
                { tag: "ig", title: "Comunidade Instagram" },
                { tag: "fb", title: "Comunidade Atletas" },
                { tag: "x", title: "Notícias & Updates" },
              ].map((item, i) => (
                <div
                  key={i}
                  title={item.title}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1.5px solid #1E2022",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1E2022",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-sans-ui)",
                    cursor: "pointer",
                    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E2022";
                    e.currentTarget.style.color = "#D2FB4C";
                    e.currentTarget.style.transform = "scale(1.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.color = "#1E2022";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {item.tag}
                </div>
              ))}
            </div>

            {/* Métricas de Impacto no Rodapé (+250k / +800k da referência) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(18px, 3vw, 32px)",
                paddingTop: 20,
                borderTop: "1px solid rgba(30, 32, 34, 0.12)",
                marginTop: 6,
              }}
            >
              {/* Métrica 1 */}
              <div>
                <div
                  className="font-extended"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                    fontWeight: 900,
                    color: "#1E2022",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  +250k
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6E7277",
                    lineHeight: 1.45,
                    marginTop: 8,
                    fontFamily: "var(--font-sans-ui)",
                    fontWeight: 600,
                  }}
                >
                  Treinos concluídos e registrados com histórico de cargas e volume.
                </div>
              </div>

              {/* Métrica 2 */}
              <div>
                <div
                  className="font-extended"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                    fontWeight: 900,
                    color: "#1E2022",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  +800k
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6E7277",
                    lineHeight: 1.45,
                    marginTop: 8,
                    fontFamily: "var(--font-sans-ui)",
                    fontWeight: 600,
                  }}
                >
                  Toneladas levantadas por atletas que superam limites todos os dias.
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------
              LADO DIREITO: CARD MODULAR AMARELO / ÂMBAR DA REFERÊNCIA
              (COM NOTCHES VETORIAIS CONTÍNUOS, FOTO PÚBLICA, GLOBO & 3 ABAS)
              -------------------------------------------------------- */}
          <div
            ref={cardContainerRef}
            className="hud-showcase-elem"
            style={{
              position: "relative",
              width: "100%",
              minHeight: isMobile ? 380 : 540,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* SVG MÁSCARA & FORMA VETORIAL DO CARD ÂMBAR */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                overflow: "visible",
                filter: "drop-shadow(0 20px 40px rgba(250, 176, 59, 0.28))",
              }}
            >
              <defs>
                <clipPath id="showcase-card-clip">
                  <path d={yellowCardPath} />
                </clipPath>
              </defs>

              {/* Fundo Âmbar/Dourado preenchendo a forma curvilínea */}
              <path d={yellowCardPath} fill="#FAB03B" />

              {/* Borda Externa Escura (#1E2022) contornando cada recorte perfeitamente */}
              <path
                d={yellowCardPath}
                fill="none"
                stroke="#1E2022"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* CAMADA INTERNA RECORTADA (FOTO PÚBLICA & ASSINATURA) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                clipPath: "url(#showcase-card-clip)",
                WebkitClipPath: "url(#showcase-card-clip)",
                pointerEvents: "none",
              }}
            >
              {/* Foto Pública de Alta Resolução de Atleta / Treino */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1100&q=85"
                  alt="Atleta GymClub Alta Performance"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center 18%",
                  }}
                />
                {/* Gradiente sutil para harmonizar a iluminação com o tom dourado */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(250, 176, 59, 0.38) 0%, rgba(20, 22, 24, 0.42) 100%)",
                  }}
                />
              </div>

              {/* Assinatura Caligráfica em Marca d'Água no Topo Esquerdo ("Quantum" style) */}
              <svg
                width={isMobile ? "160" : "220"}
                height={isMobile ? "58" : "80"}
                viewBox="0 0 220 80"
                style={{
                  position: "absolute",
                  top: isMobile ? 12 : 24,
                  left: isMobile ? 16 : 28,
                  zIndex: 4,
                  opacity: 0.85,
                }}
              >
                {/* Traçado Fluido Vetorial Cursivo */}
                <path
                  d="M 15 50 Q 25 15, 45 42 Q 65 65, 80 35 Q 95 10, 105 45 Q 115 62, 130 38 Q 145 15, 160 46 Q 175 68, 195 35"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <text
                  x="20"
                  y="44"
                  fill="#FFFFFF"
                  fontFamily="serif"
                  fontStyle="italic"
                  fontSize="28"
                  fontWeight="600"
                  letterSpacing="1px"
                >
                  GymClub
                </text>
              </svg>
            </div>

            {/* ========================================================
                NOTCH SUPERIOR DIREITO: BOTÃO CIRCULAR COM ÍCONE DO GLOBO
                (Posicionado com exatidão na cavidade superior direita)
                ======================================================== */}
            <div
              style={{
                position: "absolute",
                top: isMobile ? 6 : 8,
                right: isMobile ? 6 : 8,
                zIndex: 6,
                width: isMobile ? 42 : 52,
                height: isMobile ? 42 : 52,
                borderRadius: "50%",
                backgroundColor: "#1E2022",
                border: isMobile ? "2px solid #FFFFFF" : "2.5px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D2FB4C";
                e.currentTarget.style.color = "#1E2022";
                e.currentTarget.style.transform = "scale(1.12) rotate(15deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1E2022";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              }}
              title="Rede Global GymClub"
            >
              <Globe size={isMobile ? 20 : 24} strokeWidth={2.4} />
            </div>

            {/* ========================================================
                NOTCH LATERAL ESQUERDO: AS 3 ABAS CIRCULARES FLUTUANTES
                (2 Thumbnails de fotos + Botão com seta ↗)
                ======================================================== */}
            <div
              style={{
                position: "absolute",
                left: isMobile ? 6 : 12,
                top: bayTop + (isMobile ? 8 : 14),
                zIndex: 6,
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 8 : 12,
              }}
            >
              {/* Thumbnail 1: Foto do Módulo de Cargas */}
              <div
                title="Histórico de Cargas"
                style={{
                  width: isMobile ? 36 : 48,
                  height: isMobile ? 36 : 48,
                  borderRadius: "50%",
                  border: isMobile ? "2px solid #1E2022" : "2.5px solid #1E2022",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80"
                  alt="Módulo de Cargas"
                  fill
                  sizes="50px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Thumbnail 2: Foto do Cofre de Evolução */}
              <div
                title="Cofre de Evolução Física"
                style={{
                  width: isMobile ? 36 : 48,
                  height: isMobile ? 36 : 48,
                  borderRadius: "50%",
                  border: isMobile ? "2px solid #1E2022" : "2.5px solid #1E2022",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Image
                  src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=200&q=80"
                  alt="Evolução Física"
                  fill
                  sizes="50px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Botão de Ação Circular com Seta (↗) */}
              <Link
                href="/register"
                title="Acessar Plataforma GymClub"
                style={{
                  width: isMobile ? 36 : 48,
                  height: isMobile ? 36 : 48,
                  borderRadius: "50%",
                  backgroundColor: "#1E2022",
                  border: isMobile ? "2px solid #FFFFFF" : "2.5px solid #FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D2FB4C";
                  e.currentTarget.style.color = "#1E2022";
                  e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E2022";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <ArrowUpRight size={isMobile ? 17 : 22} strokeWidth={2.8} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
