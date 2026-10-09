"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Play,
  Sun,
  Triangle,
  Menu,
  X,
  Sparkles,
  Dumbbell,
  BookOpen,
  Info,
  Home,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import BentoStoreSection from "@/components/marketing/BentoStoreSection";
import AiSection from "@/components/marketing/AiSection";
import PlatformShowcaseSection from "@/components/marketing/PlatformShowcaseSection";
import CtaAndFooterSection from "@/components/marketing/CtaAndFooterSection";
import DynamicScrollHUD from "@/components/marketing/DynamicScrollHUD";
import GymClubLogo from "@/components/ui/GymClubLogo";

export default function MarketingLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // Dimensões do Hero medidas do elemento real (100% full width)
  const [heroSize, setHeroSize] = useState({ width: 1400, height: 560 });
  const [isMeasured, setIsMeasured] = useState(false);

  // Estado do Menu Oculto Mobile (Hidden Menu)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Observador de Redimensionamento para largura total e responsividade contínua
  useEffect(() => {
    if (!heroContainerRef.current) return;

    const updateSize = () => {
      if (heroContainerRef.current) {
        const { clientWidth, clientHeight } = heroContainerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setHeroSize({
            width: clientWidth,
            height: clientHeight,
          });
          setIsMeasured(true);
        }
      }
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(heroContainerRef.current);

    return () => ro.disconnect();
  }, []);

  // Animação GSAP no Reload: Traçado das Linhas -> Conexão -> Preenchimento -> Aparição dos Elementos
  useEffect(() => {
    if (!isMeasured) return;

    const ctx = gsap.context(() => {
      // 1. Prepara todos os caminhos para o efeito de traçado (wireframe drawing)
      const drawLines = document.querySelectorAll<SVGPathElement | SVGRectElement | SVGLineElement>(
        ".hud-draw-line"
      );

      drawLines.forEach((p) => {
        try {
          const length = (p as SVGPathElement).getTotalLength
            ? (p as SVGPathElement).getTotalLength()
            : 2400;
          p.style.strokeDasharray = `${length}`;
          p.style.strokeDashoffset = `${length}`;
        } catch {
          p.style.strokeDasharray = "2400";
          p.style.strokeDashoffset = "2400";
        }
      });

      // 2. Timeline Principal Coreografada
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      // Fase 1: As linhas perimetrais se desenham do zero até o fechamento (1.25s)
      tl.to(".hud-draw-line", {
        strokeDashoffset: 0,
        duration: 1.25,
        stagger: 0.05,
      });

      // Fase 2: Ao conectarem as linhas, os contornos se solidificam na cor da moldura (#1E2022)
      tl.to(
        ".hud-draw-line",
        {
          stroke: "#1E2022",
          duration: 0.25,
          ease: "power1.out",
        },
        "-=0.2"
      );

      // Fase 3: As cores de preenchimento (menta, branco, periwinkle, limão) fluem instantaneamente
      tl.to(
        ".hud-fill-layer",
        {
          opacity: 1,
          duration: 0.35,
          ease: "power1.out",
        },
        "-=0.25"
      );

      // Fase 4: Os elementos internos surgem com stagger gracioso e suave elevação
      tl.to(
        ".hud-elem-content",
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.035,
          ease: "power3.out",
        },
        "-=0.1"
      );

      // Fase 5: Animação complementar do gráfico de ondas no Card 1
      tl.fromTo(
        ".hud-wave-curve",
        { strokeDashoffset: 500 },
        { strokeDashoffset: 0, duration: 0.95, ease: "power2.out" },
        "-=0.4"
      );

      // Fase 6: Pop da tag fluorescente +100kg
      tl.fromTo(
        ".hud-badge-pop",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" },
        "-=0.4"
      );

      // Fase 7: Efeito elástico das pílulas de modalidades no Card 2
      tl.fromTo(
        ".hud-pill",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, ease: "back.out(1.6)" },
        "-=0.5"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isMeasured]);

  // Efeito de Entrada do Hidden Menu Mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        ".mobile-menu-item",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Geometria Vetorial Contínua do Hero com Inverted Border Radius (Cantos Côncavos)
  const W = heroSize.width;
  const H = heroSize.height;

  // Ajuste adaptativo para telas móveis estreitas vs desktops
  const isMobile = W < 768;

  // Raio dos cantos externos padrão do Hero
  const R = isMobile ? 22 : 28;

  // Aba Superior Esquerda (Logo Tab GYMCLUB)
  const th = isMobile ? 48 : 56;
  const tw = isMobile
    ? Math.min(180, Math.max(140, W * 0.42))
    : Math.min(236, Math.max(190, W * 0.21));
  const rTab = isMobile ? 16 : 20; // convex corner
  const sTab = isMobile ? 16 : 20; // concave scoop

  // Botão Inferior Direito (CTA COMECE AGORA)
  const bh = isMobile ? 54 : 66;
  const bw = isMobile
    ? Math.min(200, Math.max(160, W * 0.46))
    : Math.min(244, Math.max(195, W * 0.22));
  const rBtn = isMobile ? 18 : 22; // convex corner
  const sBtnTop = isMobile ? 18 : 22; // concave scoop
  const sBtnLeft = isMobile ? 18 : 22; // concave scoop

  // 1. Path do Fundo Menta (#CADBD0) do Hero com recortes perfeitos
  const mintHeroPath = `
    M ${tw + sTab} 0
    L ${W - R} 0
    Q ${W} 0, ${W} ${R}
    L ${W} ${H - bh - sBtnTop}
    Q ${W} ${H - bh}, ${W - sBtnTop} ${H - bh}
    L ${W - bw + rBtn} ${H - bh}
    Q ${W - bw} ${H - bh}, ${W - bw} ${H - bh + rBtn}
    L ${W - bw} ${H - sBtnLeft}
    Q ${W - bw} ${H}, ${W - bw - sBtnLeft} ${H}
    L ${R} ${H}
    Q 0 ${H}, 0 ${H - R}
    L 0 ${th}
    L ${tw - rTab} ${th}
    Q ${tw} ${th}, ${tw} ${th - rTab}
    L ${tw} ${sTab}
    Q ${tw} 0, ${tw + sTab} 0
    Z
  `;

  // 2. Path da Aba Superior Esquerda do Logo (#1E2022)
  const logoTabPath = `
    M 0 ${R}
    Q 0 0, ${R} 0
    L ${tw + sTab} 0
    Q ${tw} 0, ${tw} ${sTab}
    L ${tw} ${th - rTab}
    Q ${tw} ${th}, ${tw - rTab} ${th}
    L 0 ${th}
    Z
  `;

  // 3. Path do Botão Inferior Direito (#D2FB4C)
  const bx = W - bw;
  const by = H - bh;
  const limeButtonPath = `
    M ${bx + rBtn} ${by}
    L ${W - rBtn} ${by}
    Q ${W} ${by}, ${W} ${by + rBtn}
    L ${W} ${H - R}
    Q ${W} ${H}, ${W - R} ${H}
    L ${bx + rBtn} ${H}
    Q ${bx} ${H}, ${bx} ${H - rBtn}
    L ${bx} ${by + rBtn}
    Q ${bx} ${by}, ${bx + rBtn} ${by}
    Z
  `;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ========================================================
          1. HERO PRINCIPAL (LARGURA TOTAL 100% COM BORDAS DESENHADAS)
          ======================================================== */}
      <div
        id="hero-section"
        ref={heroContainerRef}
        style={{
          width: "100%",
          minHeight: isMobile ? 560 : "clamp(520px, 58vh, 640px)",
          position: "relative",
          borderRadius: R,
          overflow: "visible",
        }}
      >
        {/* SVG Vetorial de Alta Precisão: Traçado das Linhas e Preenchimento */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          {/* Preenchimentos que começam ocultos e se iluminam na conexão */}
          <path
            className="hud-fill-layer"
            d={mintHeroPath}
            fill="#CADBD0"
            style={{ opacity: 0 }}
          />
          <path
            className="hud-fill-layer"
            d={logoTabPath}
            fill="#1E2022"
            style={{ opacity: 0 }}
          />
          <path
            className="hud-fill-layer"
            d={limeButtonPath}
            fill="#D2FB4C"
            style={{ opacity: 0 }}
          />

          {/* Linhas de Traçado que se desenham no Reload */}
          <path
            className="hud-draw-line"
            d={mintHeroPath}
            stroke="#CADBD0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="hud-draw-line"
            d={logoTabPath}
            stroke="#CADBD0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="hud-draw-line"
            d={limeButtonPath}
            stroke="#D2FB4C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Camada de Conteúdo Interativo do Hero */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            minHeight: isMobile ? 560 : "clamp(520px, 58vh, 640px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          {/* Header Superior: Logo Tab, Menus Centrais e Baixar App / Menu Toggle */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: th,
              paddingRight: isMobile ? 14 : 24,
            }}
          >
            {/* Aba do Logo no Canto Superior Esquerdo */}
            <Link
              href="/"
              className="hud-elem-content"
              style={{
                width: tw,
                height: th,
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: isMobile ? 16 : 24,
                color: "#FFFFFF",
                textDecoration: "none",
                opacity: 0,
                transform: "translateY(16px)",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: "#D2FB4C",
                  boxShadow: "0 0 10px rgba(210, 251, 76, 0.8)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-extended)",
                  fontWeight: 800,
                  fontSize: isMobile ? "1.05rem" : "1.2rem",
                  letterSpacing: "-0.5px",
                  color: "#FFFFFF",
                }}
              >
                GYMCLUB
              </span>
            </Link>

            {/* Menus de Navegação (Desktop) */}
            <nav
              className="hud-elem-content desktop-nav-links hidden lg:flex items-center"
              style={{
                gap: 36,
                fontFamily: "var(--font-sans-ui)",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color: "#1E2022",
                textTransform: "uppercase",
                opacity: 0,
                transform: "translateY(16px)",
              }}
            >
              <Link
                href="/"
                style={{ transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                INÍCIO
              </Link>
              <Link
                href="/workouts"
                style={{ transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                SERVIÇOS
              </Link>
              <Link
                href="#app-info"
                style={{ transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                SOBRE O APP
              </Link>
              <Link
                href="/ai-coach"
                style={{ transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                BLOG
              </Link>
            </nav>

            {/* Ações à Direita: Baixar App (Desktop) e Botão Hamburger (Mobile) */}
            <div
              className="hud-elem-content"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: 0,
                transform: "translateY(16px)",
              }}
            >
              {/* Botão Baixar App (Oculto em telas ultra-estreitas para dar foco ao menu) */}
              <Link
                href="/login"
                className="hide-on-mobile-xs"
                style={{
                  backgroundColor: "#1E2022",
                  color: "#FFFFFF",
                  padding: isMobile ? "8px 16px" : "10px 22px",
                  borderRadius: 9999,
                  fontFamily: "var(--font-sans-ui)",
                  fontSize: isMobile ? "0.72rem" : "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "transform 0.2s, background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                BAIXAR APP
              </Link>

              {/* Botão do Menu Oculto (Mobile Hamburger Toggle) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="mobile-nav-toggle flex lg:hidden items-center justify-center"
                aria-label="Abrir Menu de Navegação"
                style={{
                  width: isMobile ? 38 : 42,
                  height: isMobile ? 38 : 42,
                  borderRadius: 12,
                  background: "#1E2022",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s, background-color 0.2s",
                }}

                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Menu size={20} strokeWidth={2.4} />
              </button>
            </div>
          </header>

          {/* Área Central: Foto da Atleta e Headline Responsiva */}
          <div
            style={{
              display: isMobile ? "flex" : "grid",
              flexDirection: isMobile ? "column" : undefined,
              gridTemplateColumns: isMobile ? undefined : "1.15fr 1fr",
              alignItems: isMobile ? "center" : "flex-end",
              position: "relative",
              minHeight: isMobile ? 540 : 460,
              padding: isMobile ? "10px 16px 0 16px" : "0 36px",
              boxSizing: "border-box",
              flex: 1,
            }}
          >
            {/* NO MOBILE: A Headline fica no topo para nunca ser obstruída! */}
            {isMobile && (
              <div
                className="hud-elem-content"
                style={{
                  width: "100%",
                  textAlign: "center",
                  paddingTop: 8,
                  zIndex: 4,
                  opacity: 0,
                  transform: "translateY(16px)",
                }}
              >
                <h1
                  className="font-extended"
                  style={{
                    color: "#1E2022",
                    fontSize: "clamp(1.7rem, 7.8vw, 3.2rem)",
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    textTransform: "uppercase",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  <div>SHAPE YOUR BODY</div>
                </h1>
                <div
                  style={{
                    marginTop: 6,
                    color: "#1E2022",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans-ui)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  A MELHOR VERSÃO DE SI MESMO
                </div>
              </div>
            )}

            {/* FOTO DA ATLETA COM BLOBS ORGÂNICOS (ANCORADA NA BORDA INFERIOR) */}
            <div
              className="hud-elem-content"
              style={{
                position: isMobile ? "absolute" : "relative",
                bottom: 0,
                left: isMobile ? "44%" : undefined,
                transform: isMobile ? "translateX(-50%)" : "translateY(16px)",
                height: isMobile ? 440 : 480,
                width: isMobile ? 360 : "auto",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 2,
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              {/* Formas orgânicas verde-oliva (#9DB6A8) ao fundo */}
              <div
                className="animate-blob-slow"
                style={{
                  position: "absolute",
                  top: isMobile ? 40 : 60,
                  left: isMobile ? 20 : 40,
                  width: isMobile ? 140 : 180,
                  height: isMobile ? 140 : 180,
                  borderRadius: "50%",
                  backgroundColor: "#9DB6A8",
                  opacity: 0.85,
                  zIndex: 1,
                }}
              />
              <div
                className="animate-blob-slow"
                style={{
                  position: "absolute",
                  top: isMobile ? 15 : 30,
                  right: isMobile ? 25 : undefined,
                  left: isMobile ? undefined : 180,
                  width: isMobile ? 210 : 260,
                  height: isMobile ? 210 : 260,
                  borderRadius: "44% 56% 62% 38% / 48% 46% 54% 52%",
                  backgroundColor: "#9DB6A8",
                  opacity: 0.9,
                  zIndex: 1,
                }}
              />

              {/* Imagem Recortada da Atleta (public/assets/busto.png) */}
              <div
                style={{
                  position: "relative",
                  width: isMobile ? 350 : 450,
                  height: isMobile ? 440 : 480,
                  zIndex: 2,
                }}
              >
                <Image
                  src="/assets/busto.png"
                  alt="Atleta em treino GymClub"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 50vw"
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>
            </div>

            {/* NO DESKTOP: Headline à Direita */}
            {!isMobile && (
              <div
                className="hud-elem-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingBottom: 76,
                  paddingLeft: 24,
                  zIndex: 3,
                  opacity: 0,
                  transform: "translateY(16px)",
                }}
              >
                <h1
                  className="font-extended"
                  style={{
                    color: "#1E2022",
                    fontSize: "clamp(3.8rem, 6.4vw, 5.8rem)",
                    fontWeight: 800,
                    lineHeight: 0.94,
                    letterSpacing: "-0.04em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  <div>SHAPE</div>
                  <div>YOUR</div>
                  <div>BODY</div>
                </h1>

                <div
                  style={{
                    marginTop: 26,
                    color: "#1E2022",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans-ui)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  A MELHOR VERSÃO DE SI MESMO
                </div>
              </div>
            )}
          </div>

          {/* Botão Inferior Direito "COMECE AGORA" (posicionado no recorte verde-limão) */}
          <div
            className="hud-elem-content"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: bw,
              height: bh,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            <Link
              href="/register"
              className="glow-lime"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 8 : 12,
                color: "#1E2022",
                fontFamily: "var(--font-sans-ui)",
                fontSize: isMobile ? "0.82rem" : "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: rBtn,
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>COMECE AGORA</span>
              <ArrowUpRight size={isMobile ? 18 : 22} strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. BENTO BOX GRID (RESPONSIVO: 1 COLUNA MOBILE, 3 COLUNAS DESKTOP)
          ======================================================== */}
      <div
        id="features-section"
        className="bento-cards-grid"
        style={{
          display: "grid",
          width: "100%",
        }}
      >
        {/* ----------------------------------------------------
            CARD 1: EVOLUÇÃO / CARGAS & DESEMPENHO (#1E2022)
            ---------------------------------------------------- */}
        <div
          style={{
            position: "relative",
            minHeight: 250,
            borderRadius: 24,
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* SVG Frame de Linhas e Preenchimento */}
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
              className="hud-fill-layer"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              fill="#1E2022"
              style={{ opacity: 0 }}
            />
            <rect
              className="hud-draw-line"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              stroke="#868CF0"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>

          {/* Conteúdo do Card 1 */}
          <div
            className="hud-elem-content"
            style={{
              position: "relative",
              zIndex: 2,
              padding: "24px 24px 18px 24px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              boxSizing: "border-box",
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: "#8E9296",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans-ui)",
                  marginBottom: 4,
                }}
              >
                EVOLUÇÃO
              </div>
              <h3
                className="font-extended"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Progresso de Cargas
              </h3>
            </div>

            {/* Gráfico Senoidal com Coluna Destacada e Tag Fluorescente */}
            <div
              style={{
                position: "relative",
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "12px 0 6px 0",
              }}
            >
              {/* Coluna Vertical Iluminada com Gradiente (Mês Dezembro) */}
              <div
                style={{
                  position: "absolute",
                  left: "58%",
                  top: 0,
                  bottom: 0,
                  width: 48,
                  transform: "translateX(-50%)",
                  background:
                    "linear-gradient(180deg, rgba(134, 140, 240, 0.45) 0%, rgba(30, 32, 34, 0.05) 100%)",
                  borderRadius: 14,
                  border: "1px solid rgba(134, 140, 240, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Tag Fluorescente "+100kg" */}
                <div
                  className="hud-badge-pop"
                  style={{
                    position: "absolute",
                    top: -10,
                    backgroundColor: "#D2FB4C",
                    color: "#1E2022",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 9999,
                    fontFamily: "var(--font-sans-ui)",
                    boxShadow: "0 2px 8px rgba(210, 251, 76, 0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  +100kg
                </div>

                {/* Ponto Brilhante no Topo da Senoide */}
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#D2FB4C",
                    border: "2px solid #1E2022",
                    boxShadow: "0 0 10px #D2FB4C",
                  }}
                />
              </div>

              {/* Onda SVG (Senoide em #868CF0) */}
              <svg
                width="100%"
                height="80"
                viewBox="0 0 320 80"
                fill="none"
                style={{ overflow: "visible" }}
              >
                <path
                  className="hud-wave-curve"
                  d="M 10 55 C 60 75, 90 20, 140 45 C 160 55, 170 25, 186 28 C 210 32, 230 65, 270 50 C 290 42, 305 48, 315 50"
                  stroke="#868CF0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="500"
                />
              </svg>
            </div>

            {/* Rótulos dos Meses */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6E7277",
                fontFamily: "var(--font-sans-ui)",
                padding: "0 8px",
              }}
            >
              <span>Out</span>
              <span>Nov</span>
              <span style={{ color: "#FFFFFF", fontWeight: 700 }}>Dez</span>
              <span>Jan</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            CARD 2: EXPLORE / MODALIDADES (#FFFFFF)
            ---------------------------------------------------- */}
        <div
          style={{
            position: "relative",
            minHeight: 250,
            borderRadius: 24,
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* SVG Frame de Linhas e Preenchimento */}
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
              className="hud-fill-layer"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              fill="#FFFFFF"
              style={{ opacity: 0 }}
            />
            <rect
              className="hud-draw-line"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              stroke="#CADBD0"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>

          {/* Conteúdo do Card 2 */}
          <div
            className="hud-elem-content"
            style={{
              position: "relative",
              zIndex: 2,
              padding: "24px 20px",
              color: "#1E2022",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              boxSizing: "border-box",
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: "#8E9296",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans-ui)",
                  marginBottom: 4,
                }}
              >
                EXPLORE
              </div>
              <h3
                className="font-extended"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Modalidades
              </h3>
            </div>

            {/* Cluster de Pílulas Angulares Dinâmicas */}
            <div
              style={{
                position: "relative",
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Pílula 1: DEFINIÇÃO */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  backgroundColor: "#FFFFFF",
                  color: "#1E2022",
                  border: "2px solid #1E2022",
                  borderRadius: 9999,
                  padding: "8px 18px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  transform: "rotate(-16deg)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "rotate(-16deg) scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "rotate(-16deg) scale(1)")
                }
              >
                DEFINIÇÃO
              </div>

              {/* Pílula 2: CARDIO */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  top: 14,
                  right: 8,
                  backgroundColor: "#1E2022",
                  color: "#FFFFFF",
                  borderRadius: 9999,
                  padding: "8px 18px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  transform: "rotate(14deg)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "rotate(14deg) scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "rotate(14deg) scale(1)")
                }
              >
                CARDIO
              </div>

              {/* Badge Central Triangular */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  top: "42%",
                  left: "48%",
                  transform: "translate(-50%, -50%)",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2px solid #1E2022",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 900,
                }}
              >
                <Triangle size={12} fill="#1E2022" />
              </div>

              {/* Pílula 3: FORÇA */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  backgroundColor: "#1E2022",
                  color: "#FFFFFF",
                  borderRadius: 9999,
                  padding: "9px 18px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  transform: "rotate(-10deg)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "rotate(-10deg) scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "rotate(-10deg) scale(1)")
                }
              >
                FORÇA
              </div>

              {/* Pílula 4: YOGA */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 44,
                  backgroundColor: "#FFFFFF",
                  color: "#1E2022",
                  border: "2px solid #1E2022",
                  borderRadius: 9999,
                  padding: "8px 18px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  transform: "rotate(6deg)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "rotate(6deg) scale(1.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "rotate(6deg) scale(1)")
                }
              >
                YOGA
              </div>

              {/* Badge Estelar Fluorescente */}
              <div
                className="hud-pill"
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#1E2022",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D2FB4C",
                  cursor: "pointer",
                }}
              >
                <Sun size={15} color="#D2FB4C" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            CARD 3: BAIXE O APP / CONEXÕES (#868CF0 PERIWINKLE)
            ---------------------------------------------------- */}
        <div
          style={{
            position: "relative",
            minHeight: 250,
            borderRadius: 24,
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* SVG Frame de Linhas e Preenchimento */}
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
              className="hud-fill-layer"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              fill="#868CF0"
              style={{ opacity: 0 }}
            />
            <rect
              className="hud-draw-line"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="24"
              stroke="#D2FB4C"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>

          {/* Conteúdo do Card 3 */}
          <div
            className="hud-elem-content"
            style={{
              position: "relative",
              zIndex: 2,
              padding: isMobile ? "20px 20px" : "24px 28px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              boxSizing: "border-box",
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            {/* Topo do Card 3: QR Code, Título e Badges de Lojas */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "74px 1fr auto" : "84px 1fr auto",
                gap: isMobile ? 12 : 18,
                alignItems: "center",
              }}
            >
              {/* QR Code Vetorial Estilizado */}
              <div
                style={{
                  width: isMobile ? 74 : 84,
                  height: isMobile ? 74 : 84,
                  backgroundColor: "transparent",
                  border: "3px solid #FFFFFF",
                  borderRadius: 14,
                  padding: 6,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "repeat(3, 1fr)",
                  gap: 4,
                }}
              >
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div
                  style={{
                    backgroundColor: "transparent",
                    border: "2px solid #FFFFFF",
                    borderRadius: 2,
                  }}
                />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 4 }} />
              </div>

              {/* Texto Descritivo */}
              <div>
                <h4
                  className="font-extended"
                  style={{
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    fontWeight: 800,
                    margin: "0 0 4px 0",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.15,
                  }}
                >
                  BAIXE NOSSO APP
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: isMobile ? "0.72rem" : "0.78rem",
                    lineHeight: 1.35,
                    opacity: 0.92,
                    fontFamily: "var(--font-sans-ui)",
                  }}
                >
                  Escaneie o código e ganhe 1 mês grátis na nossa plataforma!
                </p>
              </div>

              {/* Badges de Lojas */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  title="Google Play"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <Play size={14} fill="#FFFFFF" />
                </div>
                <div
                  title="Apple App Store"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(255, 255, 255, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                  }}
                >
                  A
                </div>
              </div>
            </div>

            {/* Rodapé do Card 3: Métricas 100K + Avatares + 200 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingTop: 16,
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* 100K Usuários */}
              <div>
                <div
                  className="font-extended"
                  style={{
                    fontSize: isMobile ? "1.5rem" : "1.85rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  100K
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    opacity: 0.85,
                    textTransform: "uppercase",
                    marginTop: 4,
                    fontFamily: "var(--font-sans-ui)",
                  }}
                >
                  ATLETAS CONECTADOS
                </div>
              </div>

              {/* Avatares dos Atletas */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "#E2E8F0",
                    border: "2px solid #868CF0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1E2022",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    overflow: "hidden",
                  }}
                >
                  🧔‍♂️
                </div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "#CBD5E1",
                    border: "2px solid #868CF0",
                    marginLeft: -10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1E2022",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    overflow: "hidden",
                  }}
                >
                  👩
                </div>
              </div>

              {/* 200 Treinadores */}
              <div style={{ textAlign: "right" }}>
                <div
                  className="font-extended"
                  style={{
                    fontSize: isMobile ? "1.5rem" : "1.85rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  200
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    opacity: 0.85,
                    textTransform: "uppercase",
                    marginTop: 4,
                    fontFamily: "var(--font-sans-ui)",
                  }}
                >
                  TREINADORES
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SESSÃO BENTO STORE / EQUIPAMENTOS & ESSENCIAIS
          (CLONE DA REFERÊNCIA COM THREE.JS HOVER & ROTAÇÃO 6S)
          ======================================================== */}
      <BentoStoreSection />

      {/* ========================================================
          4. SESSÃO TREINADOR IA (INSPIRED BY DIA WITH LIVE PROMPT)
          ======================================================== */}
      <AiSection />

      {/* ========================================================
          5. PENÚLTIMA SESSÃO: SHOWCASE DA PLATAFORMA & ENTREGÁVEIS
          (CLONE DA REFERÊNCIA EDITORIAL COM CARD MODULAR ÂMBAR)
          ======================================================== */}
      <PlatformShowcaseSection />

      {/* ========================================================
          6. CONSIDERAÇÕES, CHAMADA PARA AÇÃO (CTA) & PODEROSO BENTO FOOTER
          (COM ANIMAÇÃO DE MONTAGEM DAS LINHAS HUD NO SCROLL)
          ======================================================== */}
      <CtaAndFooterSection />

      {/* ========================================================
          HUD FLUTUANTE DE NAVEGAÇÃO & TRANSIÇÃO DE WEBKIT SCROLLBAR
          ======================================================== */}
      <DynamicScrollHUD />

      {/* ========================================================
          4. HIDDEN MENU (MENU OCULTO MOBILE FULLSCREEN COM EFEITOS)
          ======================================================== */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10, 14, 22, 0.94)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 20px 32px 20px",
            boxSizing: "border-box",
            animation: "fadeIn 0.25s ease-out forwards",
          }}
        >
          {/* Topo do Menu: Logo + Botão Fechar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <GymClubLogo href="/" variant="dark" size="md" />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar Menu"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s, background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
            >
              <X size={20} strokeWidth={2.4} />
            </button>
          </div>

          {/* Links Principais do Menu em Cascata */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: "24px 0",
            }}
          >
            {[
              { label: "Início", num: "01", href: "/", icon: Home },
              { label: "Serviços & Treinos", num: "02", href: "/workouts", icon: Dumbbell },
              { label: "Sobre o Aplicativo", num: "03", href: "#app-info", icon: Info },
              { label: "Blog & Artigos", num: "04", href: "/ai-coach", icon: BookOpen },
              {
                label: "Coach IA",
                num: "05",
                href: "/ai-coach",
                icon: Sparkles,
                badge: "NOVO",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-menu-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-extended)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateX(6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--amber-light)",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className="badge badge-cyan"
                        style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.4)",
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    {item.num}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Ações Inferiores: CTAs Rápidos & Métricas */}
          <div
            className="mobile-menu-item"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: 20,
            }}
          >
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="glow-lime"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                backgroundColor: "#D2FB4C",
                color: "#1E2022",
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans-ui)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <span>COMECE AGORA</span>
              <ArrowUpRight size={20} strokeWidth={2.8} />
            </Link>

            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.9rem",
                fontFamily: "var(--font-sans-ui)",
                textAlign: "center",
                boxSizing: "border-box",
                transition: "background-color 0.2s",
              }}
            >
              ÁREA DO ATLETA (LOGIN)
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.75rem",
                marginTop: 6,
                fontFamily: "var(--font-sans-ui)",
              }}
            >
              <CheckCircle2 size={13} color="#D2FB4C" />
              <span>100K Atletas Ativos • 200+ Treinadores</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
