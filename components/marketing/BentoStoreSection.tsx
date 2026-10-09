"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Star,
  Check,
  ShieldCheck,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import gsap from "gsap";
import * as THREE from "three";

// Dados dos Produtos do Bento Grid com Detalhes Reveláveis
const PRODUCTS_DATA = [
  {
    id: "bottle-1l",
    title: "AMERICAN TALL",
    subtitle: "WATER BOTTLE",
    name: "Garrafa Térmica GymClub Pro 1.000ml",
    tag: "MAIS VENDIDO",
    price: "R$ 149,90",
    originalPrice: "R$ 189,90",
    rating: 4.9,
    reviews: 428,
    specs: [
      "Isolamento a vácuo 24h gelado / 12h quente",
      "Aço inoxidável 18/8 alimentar (BPA Free)",
      "Tampa com trava hermética e alça ergonômica",
    ],
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    theme: "light",
  },
  {
    id: "promo-20",
    title: "20% OFF",
    subtitle: "on all the products / shop it now",
    name: "Desconto Exclusivo GymClub Gear",
    tag: "OFERTA LIMITADA",
    code: "GYMCLUB20",
    discount: "20% de Desconto",
    specs: [
      "Válido para vestuário e garrafas térmicas",
      "Frete grátis para compras acima de R$ 199",
      "Cupom aplicado automaticamente no checkout",
    ],
    theme: "light",
  },
  {
    id: "apparel-tees",
    title: "CHECK OUT THE NEW STUFF",
    subtitle: "NOVA COLEÇÃO DE VESTUÁRIO",
    name: "Camisas Heavyweight Oversized Dry",
    tag: "LANÇAMENTO",
    price: "R$ 119,90",
    originalPrice: "R$ 149,90",
    rating: 5.0,
    reviews: 195,
    specs: [
      "Algodão Pima 260 GSM de alta densidade",
      "Tecnologia anti-odor respirável para treino",
      "Caimento boxy estruturado com costuras reforçadas",
    ],
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    theme: "dark",
  },
  {
    id: "bottle-titanium",
    title: "TITANIUM FLASK",
    subtitle: "COQUETELEIRA TÉRMICA",
    name: "Coqueteleira Térmica Titanium 750ml",
    tag: "EDIÇÃO BLACK",
    price: "R$ 169,90",
    originalPrice: "R$ 209,90",
    rating: 4.95,
    reviews: 312,
    specs: [
      "Grade interna mixer silenciosa para shakes",
      "Pintura eletrostática matte antiderrapante",
      "Medidor interno em mililitros e onças (oz)",
    ],
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    theme: "light",
  },
];

export default function BentoStoreSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Card Ativo revelado no Mobile (rotação automática a cada 6s ou clique)
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [autoRotateProgress, setAutoRotateProgress] = useState(0);

  // Animação de Linhas Traçadas ao entrar no Viewport
  const [hasDrawn, setHasDrawn] = useState(false);

  // 1. Observer para disparar a animação de traçado de linhas quando a seção entrar na tela
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasDrawn) {
            setHasDrawn(true);

            // Animação de desenho das linhas com GSAP
            const drawLines = sectionRef.current?.querySelectorAll<
              SVGPathElement | SVGRectElement | SVGCircleElement
            >(".hud-draw-line-store");

            if (drawLines) {
              drawLines.forEach((p) => {
                try {
                  const len = (p as SVGPathElement).getTotalLength
                    ? (p as SVGPathElement).getTotalLength()
                    : 1800;
                  p.style.strokeDasharray = `${len}`;
                  p.style.strokeDashoffset = `${len}`;
                } catch {
                  p.style.strokeDasharray = "1800";
                  p.style.strokeDashoffset = "1800";
                }
              });

              const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

              // Fase 1: Desenho das linhas perimetrais
              tl.to(".hud-draw-line-store", {
                strokeDashoffset: 0,
                duration: 1.2,
                stagger: 0.08,
              });

              // Fase 2: Solidificação dos frames
              tl.to(
                ".hud-draw-line-store",
                {
                  stroke: "#1E2022",
                  duration: 0.25,
                },
                "-=0.2"
              );

              // Fase 3: Revelação dos fills de fundo
              tl.to(
                ".hud-fill-store",
                {
                  opacity: 1,
                  duration: 0.35,
                  ease: "power1.out",
                },
                "-=0.2"
              );

              // Fase 4: Conteúdos surgem com elevação
              tl.fromTo(
                ".hud-store-elem",
                { opacity: 0, y: 18 },
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
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasDrawn]);

  // 2. Rotação Automática de 6 Segundos no Modo Responsivo (ou toque com o dedo)
  useEffect(() => {
    // A rotação automática só roda quando o usuário não estiver com o mouse em cima (Desktop)
    if (hoveredCardIndex !== null) return;

    // Inicia no card 0 se nenhum estiver selecionado
    if (activeCardIndex === null) {
      setActiveCardIndex(0);
    }

    const intervalTime = 6000; // 6 segundos
    const stepTime = 60; // atualização a cada 60ms para barra de progresso suave
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += stepTime;
      const pct = Math.min(100, (elapsed / intervalTime) * 100);
      setAutoRotateProgress(pct);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setAutoRotateProgress(0);
        setActiveCardIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % PRODUCTS_DATA.length;
        });
      }
    }, stepTime);

    return () => clearInterval(progressTimer);
  }, [activeCardIndex, hoveredCardIndex]);

  // Função para toque manual do usuário: seleciona imediatamente o card e reseta os 6s
  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
    setAutoRotateProgress(0);
  };

  // 3. Efeito Interativo Three.js (WebGL Canvas) no Hover
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Luzes Dinâmicas que reagem ao mouse
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd2fb4c, 2.5, 20); // Neon Lime Specular
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x868cf0, 2.0, 20); // Periwinkle Rim
    secondaryLight.position.set(-2, 2, 2);
    scene.add(secondaryLight);

    // Campo de Partículas Interativas 3D (Efeito Aura / Energia ao passar o mouse)
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      scales[i] = Math.random() * 0.08 + 0.03;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd2fb4c,
      size: 0.07,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Anel Orbital 3D Sutil de Destaque
    const ringGeo = new THREE.RingGeometry(1.6, 1.62, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd2fb4c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Mouse Tracking
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 2.5;
      targetY = y * 1.8;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Loop de Renderização 60FPS
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Suave interpolação da luz seguindo o ponteiro do mouse
      pointLight.position.x += (targetX - pointLight.position.x) * 0.08;
      pointLight.position.y += (targetY - pointLight.position.y) * 0.08;

      // Movimento suave das partículas
      particles.rotation.y = elapsedTime * 0.06;
      particles.rotation.x = Math.sin(elapsedTime * 0.04) * 0.1;

      // Pulso sutil do anel
      ring.rotation.z = elapsedTime * 0.12;
      ring.scale.setScalar(1 + Math.sin(elapsedTime * 1.5) * 0.04);

      renderer.render(scene, camera);
    };

    animate();

    // Redimensionamento do canvas
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="store-section"
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
      {/* Canvas WebGL Three.js para o efeito de iluminação e partículas ao passar o mouse */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Grade Principal do Bento Box (Clone da Referência com 2 Colunas e Intersecções Côncavas) */}
      <div
        className="bento-store-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.52fr 1fr",
          gap: 12,
          position: "relative",
          width: "100%",
          minHeight: 640,
        }}
      >
        {/* ==========================================================
            COLUNA DA ESQUERDA: Card 1 (Topo) + Cards 2 e 3 (Base)
            ========================================================== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          {/* --------------------------------------------------------
              CARD 1: AMERICAN TALL / WATER BOTTLE (Top-Left)
              -------------------------------------------------------- */}
          <div
            onClick={() => handleCardClick(0)}
            onMouseEnter={() => setHoveredCardIndex(0)}
            onMouseLeave={() => setHoveredCardIndex(null)}
            style={{
              position: "relative",
              height: 380,
              borderRadius: 28,
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: "#E8ECE9",
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
                className="hud-fill-store"
                x="1.5"
                y="1.5"
                width="calc(100% - 3px)"
                height="calc(100% - 3px)"
                rx="28"
                fill="#E8ECE9"
                style={{ opacity: 0 }}
              />
              <rect
                className="hud-draw-line-store"
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

            {/* Aba Lateral com Chevron Arrow (>) */}
            <div
              className="hud-store-elem"
              style={{
                position: "absolute",
                left: 0,
                bottom: 24,
                width: 48,
                height: 48,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                border: "2.5px solid #1E2022",
                borderLeft: "none",
                backgroundColor: "#E8ECE9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1E2022",
                zIndex: 10,
              }}
            >
              <ChevronRight size={22} strokeWidth={2.8} />
            </div>

            {/* Conteúdo Visual Base do Card 1 */}
            <div
              className="hud-store-elem"
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: "100%",
                padding: "28px 32px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              {/* Título Superior Esquerdo: AMERICAN TALL */}
              <div>
                <h3
                  className="font-extended"
                  style={{
                    fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                    fontWeight: 900,
                    lineHeight: 0.95,
                    color: "#1E2022",
                    margin: 0,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <div>AMERICAN</div>
                  <div>TALL</div>
                </h3>
              </div>

              {/* Imagem Central: Garrafa Térmica Matte Black */}
              <div
                style={{
                  position: "absolute",
                  left: "48%",
                  bottom: -10,
                  transform: "translateX(-50%)",
                  width: 250,
                  height: 340,
                  zIndex: 2,
                }}
              >
                <Image
                  src={PRODUCTS_DATA[0].image || ""}
                  alt="American Tall Water Bottle"
                  fill
                  sizes="400px"
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>

              {/* Título à Direita da Garrafa: WATER BOTTLE */}
              <div
                style={{
                  textAlign: "right",
                  zIndex: 3,
                }}
              >
                <h3
                  className="font-extended"
                  style={{
                    fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                    fontWeight: 900,
                    lineHeight: 0.95,
                    color: "#1E2022",
                    margin: 0,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <div>WATER</div>
                  <div>BOTTLE</div>
                </h3>
              </div>
            </div>

            {/* PAINEL REVELÁVEL DE INFORMAÇÕES (Ativado por Hover no Desktop ou Auto/Touch no Mobile) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 8,
                backgroundColor: "rgba(18, 20, 24, 0.88)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                opacity:
                  hoveredCardIndex === 0 || activeCardIndex === 0 ? 1 : 0,
                pointerEvents:
                  hoveredCardIndex === 0 || activeCardIndex === 0
                    ? "auto"
                    : "none",
                transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Barra de Progresso dos 6s no Mobile */}
              {activeCardIndex === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: 4,
                    width: `${autoRotateProgress}%`,
                    backgroundColor: "#D2FB4C",
                    transition: "width 0.06s linear",
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#D2FB4C",
                    color: "#1E2022",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontFamily: "var(--font-sans-ui)",
                  }}
                >
                  {PRODUCTS_DATA[0].tag}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#D2FB4C",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  <Star size={14} fill="#D2FB4C" />
                  <span>{PRODUCTS_DATA[0].rating}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                    ({PRODUCTS_DATA[0].reviews})
                  </span>
                </div>
              </div>

              <div>
                <h4
                  className="font-extended"
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    margin: "0 0 8px 0",
                  }}
                >
                  {PRODUCTS_DATA[0].name}
                </h4>

                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {PRODUCTS_DATA[0].specs.map((spec, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: "0.82rem",
                        fontFamily: "var(--font-sans-ui)",
                      }}
                    >
                      <Check size={14} color="#D2FB4C" strokeWidth={2.5} />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                  paddingTop: 12,
                }}
              >
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", textDecoration: "line-through" }}>
                    {PRODUCTS_DATA[0].originalPrice}
                  </div>
                  <div
                    className="font-extended"
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "#D2FB4C",
                    }}
                  >
                    {PRODUCTS_DATA[0].price}
                  </div>
                </div>

                <Link
                  href="/register"
                  className="glow-lime"
                  style={{
                    backgroundColor: "#D2FB4C",
                    color: "#1E2022",
                    padding: "10px 20px",
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans-ui)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textTransform: "uppercase",
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>COMPRAR AGORA</span>
                </Link>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------
              LINHA INFERIOR DA ESQUERDA: Card 2 (20% OFF) + Card 3 (Apparel)
              -------------------------------------------------------- */}
          <div
            className="bento-sub-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              height: 250,
            }}
          >
            {/* CARD 2: 20% OFF COM RECORTES DE BOTÃO */}
            <div
              onClick={() => handleCardClick(1)}
              onMouseEnter={() => setHoveredCardIndex(1)}
              onMouseLeave={() => setHoveredCardIndex(null)}
              style={{
                position: "relative",
                height: "100%",
                borderRadius: 24,
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#F2F4F2",
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
                  className="hud-fill-store"
                  x="1.5"
                  y="1.5"
                  width="calc(100% - 3px)"
                  height="calc(100% - 3px)"
                  rx="24"
                  fill="#F2F4F2"
                  style={{ opacity: 0 }}
                />
                <rect
                  className="hud-draw-line-store"
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

              {/* Conteúdo Base do Card 2 */}
              <div
                className="hud-store-elem"
                style={{
                  position: "relative",
                  zIndex: 2,
                  padding: "24px 22px",
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3
                    className="font-extended"
                    style={{
                      fontSize: "clamp(2.5rem, 4vw, 3.2rem)",
                      fontWeight: 900,
                      lineHeight: 0.9,
                      color: "#1E2022",
                      letterSpacing: "-0.04em",
                      margin: 0,
                    }}
                  >
                    20% OFF
                  </h3>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#1E2022",
                      fontFamily: "var(--font-sans-ui)",
                      lineHeight: 1.3,
                    }}
                  >
                    <div>on all the products</div>
                    <div style={{ opacity: 0.75 }}>shop it now</div>
                  </div>
                </div>

                {/* Botão no Canto Inferior Direito: SHOP ALL PRODUCTS com Carrinho */}
                <div
                  style={{
                    alignSelf: "flex-end",
                    backgroundColor: "#1E2022",
                    color: "#FFFFFF",
                    padding: "8px 14px",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-sans-ui)",
                    letterSpacing: "0.4px",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.55rem", opacity: 0.7, lineHeight: 1 }}>SHOP</div>
                    <div style={{ lineHeight: 1 }}>ALL PRODUCTS</div>
                  </div>
                  <ShoppingCart size={15} />
                </div>
              </div>

              {/* Painel Revelável Card 2 */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 8,
                  backgroundColor: "rgba(18, 20, 24, 0.9)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  opacity:
                    hoveredCardIndex === 1 || activeCardIndex === 1 ? 1 : 0,
                  pointerEvents:
                    hoveredCardIndex === 1 || activeCardIndex === 1
                      ? "auto"
                      : "none",
                  transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {activeCardIndex === 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: 4,
                      width: `${autoRotateProgress}%`,
                      backgroundColor: "#D2FB4C",
                      transition: "width 0.06s linear",
                    }}
                  />
                )}
                <div>
                  <span
                    style={{
                      backgroundColor: "#D2FB4C",
                      color: "#1E2022",
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      padding: "3px 8px",
                      borderRadius: 9999,
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    {PRODUCTS_DATA[1].tag}
                  </span>
                  <h4
                    className="font-extended"
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      margin: "8px 0 4px 0",
                    }}
                  >
                    Cupom: {PRODUCTS_DATA[1].code}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", margin: 0, lineHeight: 1.3 }}>
                    Economize 20% em todas as garrafas e roupas esportivas GymClub.
                  </p>
                </div>

                <Link
                  href="/register"
                  style={{
                    backgroundColor: "#D2FB4C",
                    color: "#1E2022",
                    padding: "9px 14px",
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-sans-ui)",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  ATIVAR DESCONTO ↗
                </Link>
              </div>
            </div>

            {/* CARD 3: CHECK OUT THE NEW STUFF (Apparel Camisas) */}
            <div
              onClick={() => handleCardClick(2)}
              onMouseEnter={() => setHoveredCardIndex(2)}
              onMouseLeave={() => setHoveredCardIndex(null)}
              style={{
                position: "relative",
                height: "100%",
                borderRadius: 24,
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#141618",
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
                  className="hud-fill-store"
                  x="1.5"
                  y="1.5"
                  width="calc(100% - 3px)"
                  height="calc(100% - 3px)"
                  rx="24"
                  fill="#141618"
                  style={{ opacity: 0 }}
                />
                <rect
                  className="hud-draw-line-store"
                  x="1.5"
                  y="1.5"
                  width="calc(100% - 3px)"
                  height="calc(100% - 3px)"
                  rx="24"
                  stroke="#1E2022"
                  strokeWidth="2.5"
                  fill="none"
                />
              </svg>

              {/* Imagem de Fundo das Camisas Dobradas */}
              <div
                className="hud-store-elem"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.8,
                  zIndex: 2,
                }}
              >
                <Image
                  src={PRODUCTS_DATA[2].image || ""}
                  alt="Camisas GymClub"
                  fill
                  sizes="350px"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                />
                {/* Gradiente escuro para contraste de texto */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,22,24,0.92) 100%)",
                  }}
                />
              </div>

              {/* Texto Inferior: CHECK OUT THE NEW STUFF */}
              <div
                className="hud-store-elem"
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: 18,
                  right: 18,
                  zIndex: 3,
                }}
              >
                <div
                  className="font-extended"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                  }}
                >
                  CHECK OUT THE NEW STUFF
                </div>
              </div>

              {/* Painel Revelável Card 3 */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 8,
                  backgroundColor: "rgba(18, 20, 24, 0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  opacity:
                    hoveredCardIndex === 2 || activeCardIndex === 2 ? 1 : 0,
                  pointerEvents:
                    hoveredCardIndex === 2 || activeCardIndex === 2
                      ? "auto"
                      : "none",
                  transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {activeCardIndex === 2 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: 4,
                      width: `${autoRotateProgress}%`,
                      backgroundColor: "#D2FB4C",
                      transition: "width 0.06s linear",
                    }}
                  />
                )}
                <div>
                  <span
                    style={{
                      backgroundColor: "#D2FB4C",
                      color: "#1E2022",
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      padding: "3px 8px",
                      borderRadius: 9999,
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    {PRODUCTS_DATA[2].tag}
                  </span>
                  <h4
                    className="font-extended"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      margin: "8px 0 4px 0",
                    }}
                  >
                    {PRODUCTS_DATA[2].name}
                  </h4>
                  <div style={{ color: "#D2FB4C", fontSize: "1.2rem", fontWeight: 800 }}>
                    {PRODUCTS_DATA[2].price}
                  </div>
                </div>

                <Link
                  href="/register"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#1E2022",
                    padding: "9px 14px",
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-sans-ui)",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  VER TAMANHOS ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================
            COLUNA DA DIREITA: Card 4 (Tall Card Spanning Entire Height)
            ========================================================== */}
        <div
          onClick={() => handleCardClick(3)}
          onMouseEnter={() => setHoveredCardIndex(3)}
          onMouseLeave={() => setHoveredCardIndex(null)}
          style={{
            position: "relative",
            height: "100%",
            minHeight: 640,
            borderRadius: 28,
            overflow: "hidden",
            cursor: "pointer",
            backgroundColor: "#E8ECE9",
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
              className="hud-fill-store"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="28"
              fill="#E8ECE9"
              style={{ opacity: 0 }}
            />
            <rect
              className="hud-draw-line-store"
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

          {/* Imagem Central: Garrafa Térmica Alta Matte Black */}
          <div
            className="hud-store-elem"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              boxSizing: "border-box",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "82%",
                height: "82%",
              }}
            >
              <Image
                src={PRODUCTS_DATA[3].image || ""}
                alt="GymClub Titanium Flask"
                fill
                sizes="500px"
                style={{
                  objectFit: "contain",
                  objectPosition: "center center",
                }}
              />
            </div>
          </div>

          {/* Painel Revelável Card 4 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 8,
              backgroundColor: "rgba(18, 20, 24, 0.9)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              opacity:
                hoveredCardIndex === 3 || activeCardIndex === 3 ? 1 : 0,
              pointerEvents:
                hoveredCardIndex === 3 || activeCardIndex === 3
                  ? "auto"
                  : "none",
              transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {activeCardIndex === 3 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 4,
                  width: `${autoRotateProgress}%`,
                  backgroundColor: "#D2FB4C",
                  transition: "width 0.06s linear",
                }}
              />
            )}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    backgroundColor: "#D2FB4C",
                    color: "#1E2022",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontFamily: "var(--font-sans-ui)",
                  }}
                >
                  {PRODUCTS_DATA[3].tag}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#D2FB4C",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  <Star size={14} fill="#D2FB4C" />
                  <span>{PRODUCTS_DATA[3].rating}</span>
                </div>
              </div>

              <h4
                className="font-extended"
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: "0 0 12px 0",
                  lineHeight: 1.1,
                }}
              >
                {PRODUCTS_DATA[3].name}
              </h4>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {PRODUCTS_DATA[3].specs.map((spec, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "rgba(255, 255, 255, 0.85)",
                      fontSize: "0.85rem",
                      fontFamily: "var(--font-sans-ui)",
                    }}
                  >
                    <Check size={16} color="#D2FB4C" strokeWidth={2.5} />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                paddingTop: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Preço Promocional:</span>
                <span
                  className="font-extended"
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 900,
                    color: "#D2FB4C",
                  }}
                >
                  {PRODUCTS_DATA[3].price}
                </span>
              </div>

              <Link
                href="/register"
                className="glow-lime"
                style={{
                  width: "100%",
                  backgroundColor: "#D2FB4C",
                  color: "#1E2022",
                  padding: "14px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-sans-ui)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textTransform: "uppercase",
                  boxSizing: "border-box",
                }}
              >
                <ShoppingCart size={18} />
                <span>GARANTIR UNIDADE ↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ==========================================================
            DISTINTIVO CIRCULAR INTERSECCIONADO (+)
            Posicionado exatamente no cruzamento do Card 1, Card 3 e Card 4
            ========================================================== */}
        <div
          className="hud-store-elem intersecting-plus-badge"
          onClick={() => handleCardClick(3)}
          style={{
            position: "absolute",
            left: "calc(60.2% - 32px)",
            top: "calc(380px - 32px)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#E8ECE9",
            border: "3px solid #1E2022",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1E2022",
            zIndex: 12,
            cursor: "pointer",
            boxShadow: "0 0 16px rgba(0,0,0,0.25)",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.12) rotate(90deg)";
            e.currentTarget.style.backgroundColor = "#D2FB4C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.backgroundColor = "#E8ECE9";
          }}
        >
          <Plus size={30} strokeWidth={2.8} />
        </div>
      </div>
    </section>
  );
}
