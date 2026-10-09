"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowUpRight, Sparkles, Scale } from "lucide-react";

export default function ThreePlateCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedWeight, setSelectedWeight] = useState(20);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd2fb4c, 2.5); // Neon Lime
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x868cf0, 1.8); // Periwinkle
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    // Grupo da Anilha Olímpica 3D
    const plateGroup = new THREE.Group();

    // 1. Corpo principal da anilha (Torus / Disco chanfrado)
    const plateOuterGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.28, 36);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1f3845, // Tom teal-slate escuro da referência
      metalness: 0.85,
      roughness: 0.25,
    });
    const plateMesh = new THREE.Mesh(plateOuterGeo, plateMat);
    plateMesh.rotation.x = Math.PI / 2;
    plateGroup.add(plateMesh);

    // 2. Anel interno elevado (Relevo)
    const innerRimGeo = new THREE.TorusGeometry(0.95, 0.08, 16, 36);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd2fb4c, // Borda fluorescente
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd2fb4c,
      emissiveIntensity: 0.15,
    });
    const innerRim = new THREE.Mesh(innerRimGeo, rimMat);
    plateGroup.add(innerRim);

    // 3. Furo central olímpico (Bucha de aço)
    const holeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.32, 24);
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.1,
    });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    holeMesh.rotation.x = Math.PI / 2;
    plateGroup.add(holeMesh);

    // 4. Partículas flutuantes de poeira luminosa ao redor da anilha
    const partGeo = new THREE.BufferGeometry();
    const partCount = 45;
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i += 3) {
      partPos[i] = (Math.random() - 0.5) * 4;
      partPos[i + 1] = (Math.random() - 0.5) * 3;
      partPos[i + 2] = (Math.random() - 0.5) * 2;
    }
    partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xd2fb4c,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    scene.add(plateGroup);

    // Interação com o Mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animação Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotação suave baseada no cursor
      targetRotY = mouseX * 0.7;
      targetRotX = -mouseY * 0.5;

      plateGroup.rotation.y += (targetRotY - plateGroup.rotation.y) * 0.08;
      plateGroup.rotation.x += (targetRotX - plateGroup.rotation.x) * 0.08;

      // Giro suave contínuo no eixo Z (como se a anilha girasse na barra)
      plateGroup.rotation.z += 0.008;

      // Movimento lento das partículas
      particles.rotation.y += 0.003;

      renderer.render(scene, camera);
    };

    animate();

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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#1E2022", // Cinza-escuro / quase preto oficial da marca
        borderRadius: 24,
        padding: "20px",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 220,
        boxShadow: "0 14px 32px rgba(30, 32, 34, 0.25)",
        border: "1.5px solid rgba(255, 255, 255, 0.08)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Canvas 3D de fundo transparente com a anilha olímpica */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          right: -20,
          top: -10,
          width: 220,
          height: 220,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Topo do Card: Pílulas de Ação Rápida */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 9999,
              backgroundColor: "#CADBD0", // Verde-menta oficial
              color: "#1E2022",
              fontSize: "0.78rem",
              fontWeight: 800,
              fontFamily: "var(--font-sans-ui)",
            }}
          >
            Carga Ativa
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: 9999,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: "var(--font-sans-ui)",
            }}
          >
            +{selectedWeight * 2}kg Barra
          </div>
        </div>

        {/* Botão de Expandir / Ação com Seta */}
        <div
          title="Ver Calculadora de Cargas 1RM"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#D2FB4C";
            e.currentTarget.style.color = "#1E2022";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <ArrowUpRight size={20} strokeWidth={2.6} />
        </div>
      </div>

      {/* Meio: Seletor de Anilhas */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          margin: "18px 0 12px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            color: "#1E2022",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Anilha 3D:</span>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 900,
              fontFamily: "var(--font-extended)",
              color: "#1F3845",
            }}
          >
            {selectedWeight} kg
          </span>
        </div>

        {/* Botões seletores de peso */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[5, 10, 15, 20, 25].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeight(w)}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                backgroundColor:
                  selectedWeight === w
                    ? "#D2FB4C"
                    : "rgba(255, 255, 255, 0.1)",
                color: selectedWeight === w ? "#1E2022" : "#FFFFFF",
                fontSize: "0.72rem",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {w}k
            </button>
          ))}
        </div>
      </div>

      {/* Rodapé do Card: Projeção de Volume e Ícone Circular de Giro */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: 10,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", color: "#A8C2D1", fontWeight: 600 }}>
            Projeção de 1RM Estimada
          </div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 900,
              fontFamily: "var(--font-extended)",
              color: "#FFFFFF",
              marginTop: 2,
            }}
          >
            {Math.round(selectedWeight * 2 * 1.33 + 20)} kg
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.75rem",
            color: "#D2FB4C",
            fontWeight: 700,
          }}
        >
          <Sparkles size={14} />
          <span>Modelo 3D Interativo</span>
        </div>
      </div>
    </div>
  );
}
