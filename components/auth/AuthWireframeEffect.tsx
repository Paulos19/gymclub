"use client";

import React, { useState, useEffect } from "react";

interface AuthWireframeEffectProps {
  children: (isConstructed: boolean) => React.ReactNode;
}

export function AuthWireframeEffect({ children }: AuthWireframeEffectProps) {
  const [isConstructed, setIsConstructed] = useState(false);

  useEffect(() => {
    // Fase 1: Desenho das linhas de construção / wireframe
    // Fase 2 (após 450ms): O conteúdo completo, foto de fundo e preenchimentos se materializam
    const timer = setTimeout(() => {
      setIsConstructed(true);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-screen lg:h-screen">
      {children(isConstructed)}
    </div>
  );
}
