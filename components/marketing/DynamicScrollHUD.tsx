"use client";

import { useEffect } from "react";

interface SectionTheme {
  id: string;
  color: string;
  glow: string;
}

const SECTIONS: SectionTheme[] = [
  {
    id: "hero-section",
    color: "#CADBD0",
    glow: "rgba(202, 219, 208, 0.6)",
  },
  {
    id: "features-section",
    color: "#868CF0",
    glow: "rgba(134, 140, 240, 0.6)",
  },
  {
    id: "store-section",
    color: "#D2FB4C",
    glow: "rgba(210, 251, 76, 0.6)",
  },
  {
    id: "ai-coach-section",
    color: "#A78BFA",
    glow: "rgba(167, 139, 250, 0.6)",
  },
  {
    id: "platform-showcase-section",
    color: "#FAB03B",
    glow: "rgba(250, 176, 59, 0.65)",
  },
  {
    id: "cta-footer-section",
    color: "#D2FB4C",
    glow: "rgba(210, 251, 76, 0.7)",
  },
];

export default function DynamicScrollHUD() {
  useEffect(() => {
    const handleScroll = () => {
      // Identifica qual sessão está no terço superior da janela
      const viewportMid = window.scrollY + window.innerHeight * 0.35;

      let currentActive = SECTIONS[0];

      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (viewportMid >= top && viewportMid < top + height) {
            currentActive = SECTIONS[i];
            break;
          } else if (viewportMid >= top + height && i === SECTIONS.length - 1) {
            currentActive = SECTIONS[i];
          }
        }
      }

      // Atualiza as variáveis CSS da Scrollbar Webkit nativa em tempo real
      document.documentElement.style.setProperty("--active-scroll-thumb", currentActive.color);
      document.documentElement.style.setProperty("--active-scroll-glow", currentActive.glow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Retorna null para não renderizar nenhum elemento visual invasivo na tela
  return null;
}
