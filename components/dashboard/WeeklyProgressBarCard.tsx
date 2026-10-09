"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface DayData {
  day: string;
  name: string;
  hours: number;
  label: string;
  muscle: string;
  isToday?: boolean;
}

const WEEK_DATA: DayData[] = [
  { day: "D", name: "Dom", hours: 0.5, label: "30 min", muscle: "Mobilidade" },
  { day: "S", name: "Seg", hours: 1.4, label: "1h 25m", muscle: "Peito & Tríceps" },
  { day: "T", name: "Ter", hours: 1.2, label: "1h 10m", muscle: "Costas & Bíceps" },
  { day: "Q", name: "Qua", hours: 1.6, label: "1h 35m", muscle: "Pernas & Glúteos" },
  { day: "Q", name: "Qui", hours: 1.8, label: "1h 45m", muscle: "Ombros & Abdômen", isToday: true },
  { day: "S", name: "Sex", hours: 1.1, label: "1h 05m", muscle: "Braços Full" },
  { day: "S", name: "Sáb", hours: 0.0, label: "Descanso", muscle: "Recuperação" },
];

export default function WeeklyProgressBarCard() {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  const totalHours = "6.1 h";
  const maxHours = 2.0;

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
      {/* Topo: Título, Total e Ação Seta */}
      <div>
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
              PROGRESSO SEMANAL
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span
                className="font-extended"
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  color: "#1E2022",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {totalHours}
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#6E7277",
                  fontFamily: "var(--font-sans-ui)",
                  fontWeight: 600,
                }}
              >
                Volume nesta semana
              </span>
            </div>
          </div>

          <Link
            href="/workouts"
            title="Ver Histórico de Treinos"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "#F4F6F5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1E2022",
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
          </Link>
        </div>
      </div>

      {/* Gráfico de Barras Verticais Estilo Crextio (Referência 3) */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 150,
          padding: "16px 8px 6px 8px",
          position: "relative",
        }}
      >
        {WEEK_DATA.map((d, i) => {
          const heightPercent = Math.max(12, Math.round((d.hours / maxHours) * 100));
          const isHighlighted = d.isToday;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Tooltip flutuante no dia de hoje (ou no hover) */}
              {(isHighlighted || hoveredDay?.name === d.name) && (
                <div
                  style={{
                    position: "absolute",
                    top: -34,
                    padding: "4px 8px",
                    borderRadius: 9999,
                    backgroundColor: isHighlighted ? "#D2FB4C" : "#1E2022",
                    color: isHighlighted ? "#1E2022" : "#FFFFFF",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    fontFamily: "var(--font-sans-ui)",
                    zIndex: 5,
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  {d.label}
                </div>
              )}

              {/* Barra Vertical Estilizada */}
              <div
                style={{
                  width: 10,
                  height: `${heightPercent}%`,
                  minHeight: 14,
                  maxHeight: 110,
                  borderRadius: 9999,
                  backgroundColor: isHighlighted
                    ? "#D2FB4C" // Verde-limão oficial no dia ativo
                    : d.hours > 0
                    ? "#1E2022" // Cinza-escuro/preto da marca
                    : "rgba(30, 32, 34, 0.12)", // Barra vazia
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: hoveredDay?.name === d.name ? "scaleY(1.08)" : "scaleY(1)",
                  boxShadow: isHighlighted ? "0 0 12px rgba(210, 251, 76, 0.6)" : "none",
                }}
              />

              {/* Rótulo do Dia da Semana */}
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: isHighlighted ? 900 : 700,
                  color: isHighlighted ? "#1E2022" : "#8E9398",
                  fontFamily: "var(--font-sans-ui)",
                }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rodapé: Informação do Treino do Dia Ativo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(30, 32, 34, 0.08)",
          paddingTop: 12,
          fontSize: "0.76rem",
          fontFamily: "var(--font-sans-ui)",
        }}
      >
        <span style={{ color: "#6E7277", fontWeight: 600 }}>
          {hoveredDay ? (
            <>
              <strong>{hoveredDay.name}:</strong> {hoveredDay.muscle} ({hoveredDay.label})
            </>
          ) : (
            <>
              <strong>Hoje:</strong> Ombros & Abdômen (1h 45m)
            </>
          )}
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "#2C6B45",
            fontWeight: 800,
          }}
        >
          <TrendingUp size={13} />
          <span>+12% ritmo</span>
        </span>
      </div>
    </div>
  );
}
