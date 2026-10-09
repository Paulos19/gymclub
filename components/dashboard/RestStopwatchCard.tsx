"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ArrowUpRight, BellRing } from "lucide-react";

export default function RestStopwatchCard() {
  const [totalSeconds, setTotalSeconds] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (seconds = totalSeconds) => {
    setIsRunning(false);
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Cálculo da circunferência SVG (raio 46 -> 2 * PI * 46 ≈ 289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: "24px",
        border: "1.5px solid rgba(30, 32, 34, 0.08)",
        boxShadow: "0 8px 28px rgba(30, 32, 34, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 330,
        boxSizing: "border-box",
      }}
    >
      {/* Topo do Card */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              color: "#8E9398",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "var(--font-sans-ui)",
            }}
          >
            CRONÔMETRO DE SÉRIES
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#1E2022",
              marginTop: 4,
            }}
          >
            Descanso entre Séries
          </div>
        </div>

        <div
          title="Modo Foco"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#F4F6F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1E2022",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#D2FB4C";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F4F6F5";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <ArrowUpRight size={18} strokeWidth={2.6} />
        </div>
      </div>

      {/* Centro: Círculo Medidor Estilo Crextio (Referência 3) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          margin: "12px 0",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 130 130">
          {/* Círculo Guia de Fundo Pontilhado */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="rgba(30, 32, 34, 0.08)"
            strokeWidth="8"
            strokeDasharray="3 3"
          />

          {/* Arco de Progresso Fluorescente (#D2FB4C) */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#D2FB4C"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 65 65)"
            style={{
              transition: "stroke-dashoffset 0.5s ease",
              filter: "drop-shadow(0 0 6px rgba(210, 251, 76, 0.6))",
            }}
          />
        </svg>

        {/* Display Central do Tempo */}
        <div
          style={{
            position: "absolute",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="font-extended"
            style={{
              fontSize: "1.85rem",
              fontWeight: 900,
              color: "#1E2022",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {timeFormatted}
          </div>
          <span
            style={{
              fontSize: "0.68rem",
              color: "#8E9398",
              fontWeight: 700,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {isRunning ? "Descansando" : timeLeft === 0 ? "Bater Série!" : "Pausado"}
          </span>
        </div>
      </div>

      {/* Controles de Play, Pause e Presets Rápidos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Presets de Tempo (60s, 90s, 120s) */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[
            { sec: 60, label: "60s" },
            { sec: 90, label: "90s" },
            { sec: 120, label: "120s" },
          ].map((preset) => (
            <button
              key={preset.sec}
              onClick={() => resetTimer(preset.sec)}
              style={{
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: "0.72rem",
                fontWeight: 800,
                border: "1px solid rgba(30, 32, 34, 0.12)",
                backgroundColor: totalSeconds === preset.sec ? "#CADBD0" : "transparent",
                color: "#1E2022",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Botões Principais: Play/Pause e Reset */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            borderTop: "1px solid rgba(30, 32, 34, 0.08)",
            paddingTop: 12,
          }}
        >
          <button
            onClick={toggleTimer}
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              backgroundColor: isRunning ? "#1E2022" : "#D2FB4C",
              color: isRunning ? "#FFFFFF" : "#1E2022",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.18s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isRunning ? (
              <>
                <Pause size={14} />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play size={14} fill="#1E2022" />
                <span>Iniciar</span>
              </>
            )}
          </button>

          <button
            onClick={() => resetTimer(totalSeconds)}
            title="Reiniciar"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "#F4F6F5",
              border: "none",
              color: "#1E2022",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
