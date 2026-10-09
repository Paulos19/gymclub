"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  CloudSun,
  Droplets,
  Wind,
  Sparkles,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Compass,
} from "lucide-react";

interface WeatherData {
  city: string;
  temperature: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  conditionLabel: string;
  conditionIcon: string;
  recommendationTitle: string;
  recommendedLocation: string;
  warmupMinutes: number;
  hydrationMlPerHour: number;
  intensityAdjustment: string;
  tacticalTip: string;
  idealWorkout: string;
}

export default function WeatherAiCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationSource, setLocationSource] = useState<"geo" | "default" | "error">("default");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Efeito Three.js: Orbe sutil com partículas climáticas no fundo do card
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = 180;
    const height = 140;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Partículas em anel orbital
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.9;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff3b30,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      points.rotation.y = elapsed * 0.08;
      points.rotation.x = Math.sin(elapsed * 0.05) * 0.06;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const loadWeather = useCallback(async (lat?: number, lon?: number) => {
    setLoading(true);
    try {
      let url = "/api/ai/weather-workout";
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        // Despacha evento customizado para sincronizar a Navbar sem prop drilling
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("gymclub:weather-updated", {
              detail: {
                temp: data.temperature,
                city: data.city,
                label: data.conditionLabel,
              },
            })
          );
        }
      }
    } catch {
      // Falha silenciosa
    } finally {
      setLoading(false);
    }
  }, []);

  // Solicita geolocalização do dispositivo
  const requestDeviceLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      loadWeather();
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setLocationSource("geo");
        setLocating(false);
        loadWeather(latitude, longitude);
      },
      () => {
        // Se usuário recusar ou der timeout, usa localização padrão
        setLocationSource("default");
        setLocating(false);
        loadWeather();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [loadWeather]);

  useEffect(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  return (
    <div
      id="weather-ai-card"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E7EC",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04), 0 1px 2px rgba(16, 24, 40, 0.02)",
      }}
    >
      {/* Canvas Three.js sutil ao fundo */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 180,
          height: 140,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Topo: Header com Selo IA e Botão Atualizar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "#FFF1F0",
              border: "1px solid #FFEBEA",
            }}
          >
            <Sparkles size={12} color="#FF3B30" />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#FF3B30",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Coach IA Biomecânico
            </span>
          </div>

          <button
            onClick={() => {
              if (coords) {
                loadWeather(coords.lat, coords.lon);
              } else {
                requestDeviceLocation();
              }
            }}
            title="Atualizar clima e localização"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "#5A5E64",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            <RefreshCw size={12} className={loading || locating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">
              {locating ? "Localizando..." : "Sincronizar"}
            </span>
          </button>
        </div>

        {/* Indicador de Cidade com Geolocalização Real */}
        <div
          onClick={requestDeviceLocation}
          title={locationSource === "geo" ? "Localização precisa via GPS do dispositivo" : "Clique para usar localização precisa"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            color: locationSource === "geo" ? "#16A34A" : "#667085",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: locationSource === "geo" ? "#F0FDF4" : "#F8F9FA",
            padding: "4px 10px",
            borderRadius: "12px",
            border: `1px solid ${locationSource === "geo" ? "#DCFCE7" : "#E4E7EC"}`,
          }}
        >
          {locationSource === "geo" ? (
            <Compass size={13} color="#16A34A" />
          ) : (
            <MapPin size={13} color="#667085" />
          )}
          <span>{weather?.city || (locating ? "Obtendo GPS..." : "Detectando...")}</span>
        </div>
      </div>

      {/* Condições Meteorológicas Principais */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #ECEFF2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Thermometer size={14} color="#FF3B30" />
            <span style={{ fontSize: "11px", color: "#5A5E64", fontWeight: 500 }}>Temperatura</span>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#1E2022", lineHeight: 1.1 }}>
            {loading ? "--" : `${weather?.temperature}°C`}
          </p>
          <span style={{ fontSize: "11px", color: "#8E9298" }}>
            Sensação: {loading ? "--" : `${weather?.apparentTemp}°C`}
          </span>
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #ECEFF2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <CloudSun size={14} color="#F59E0B" />
            <span style={{ fontSize: "11px", color: "#5A5E64", fontWeight: 500 }}>Condição</span>
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#1E2022",
              lineHeight: 1.2,
              marginTop: "4px",
            }}
          >
            {loading ? "Calculando..." : weather?.conditionLabel}
          </p>
          <span style={{ fontSize: "11px", color: "#8E9298" }}>
            {weather?.precipitation ? `${weather.precipitation}mm chuva` : "Sem chuva prevista"}
          </span>
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #ECEFF2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Droplets size={14} color="#0284C7" />
            <span style={{ fontSize: "11px", color: "#5A5E64", fontWeight: 500 }}>Umidade</span>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#1E2022", lineHeight: 1.1 }}>
            {loading ? "--" : `${weather?.humidity}%`}
          </p>
          <span style={{ fontSize: "11px", color: "#8E9298" }}>
            Hidratação: {loading ? "--" : `${weather?.hydrationMlPerHour}ml/h`}
          </span>
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #ECEFF2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Wind size={14} color="#64748B" />
            <span style={{ fontSize: "11px", color: "#5A5E64", fontWeight: 500 }}>Vento</span>
          </div>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#1E2022", lineHeight: 1.1 }}>
            {loading ? "--" : `${weather?.windSpeed} km/h`}
          </p>
          <span style={{ fontSize: "11px", color: "#8E9298" }}>
            Local: {loading ? "--" : weather?.recommendedLocation}
          </span>
        </div>
      </div>

      {/* Caixa Tática de Recomendação IA */}
      <div
        style={{
          borderRadius: "16px",
          padding: "18px",
          backgroundColor: "#FAFAFA",
          border: "1px solid #EBECEF",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Flame size={16} color="#FF3B30" />
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1E2022" }}>
            {loading ? "Analisando variáveis fisiológicas..." : weather?.recommendationTitle}
          </h4>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#4B5158",
            lineHeight: 1.55,
            marginBottom: "14px",
          }}
        >
          {loading
            ? "O Coach IA está cruzando a temperatura e umidade com sua taxa de homeostase térmica..."
            : weather?.tacticalTip}
        </p>

        {/* Pílulas de Adaptação */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: "12px",
              fontWeight: 600,
              color: "#1E2022",
            }}
          >
            <CheckCircle2 size={13} color="#FF3B30" />
            <span>Aquecimento: {weather?.warmupMinutes || 10} min</span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: "12px",
              fontWeight: 600,
              color: "#1E2022",
            }}
          >
            <ShieldAlert size={13} color="#F59E0B" />
            <span>Intensidade: {weather?.intensityAdjustment || "100%"}</span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: "12px",
              fontWeight: 600,
              color: "#1E2022",
            }}
          >
            <ArrowRight size={13} color="#10B981" />
            <span>Sugerido: {weather?.idealWorkout || "Musculação"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
