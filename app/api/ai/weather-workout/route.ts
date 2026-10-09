import { NextRequest, NextResponse } from "next/server";
import { askCoachAI } from "@/lib/llm";

// Códigos WMO da Open-Meteo mapeados para descrições em português
const WEATHER_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
  0: { label: "Céu Limpo", icon: "sun" },
  1: { label: "Predomínio de Sol", icon: "sun-medium" },
  2: { label: "Parcialmente Nublado", icon: "cloud-sun" },
  3: { label: "Nublado", icon: "cloud" },
  45: { label: "Nevoeiro", icon: "cloud-fog" },
  48: { label: "Nevoeiro com Geada", icon: "cloud-fog" },
  51: { label: "Garoa Leve", icon: "cloud-drizzle" },
  53: { label: "Garoa Moderada", icon: "cloud-drizzle" },
  55: { label: "Garoa Intensa", icon: "cloud-drizzle" },
  61: { label: "Chuva Leve", icon: "cloud-rain" },
  63: { label: "Chuva Moderada", icon: "cloud-rain" },
  65: { label: "Chuva Forte", icon: "cloud-rain" },
  71: { label: "Neve Leve", icon: "snowflake" },
  80: { label: "Pancadas de Chuva Leves", icon: "cloud-rain" },
  81: { label: "Pancadas de Chuva Moderadas", icon: "cloud-rain" },
  82: { label: "Pancadas de Chuva Violentas", icon: "cloud-lightning" },
  95: { label: "Trovoada", icon: "cloud-lightning" },
  96: { label: "Trovoada com Granizo Leve", icon: "cloud-lightning" },
  99: { label: "Trovoada com Granizo Forte", icon: "cloud-lightning" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    // Coordenadas padrão (São Paulo - SP) caso o usuário não informe ou negue geolocalização
    let lat = latParam ? parseFloat(latParam) : -23.5505;
    let lon = lonParam ? parseFloat(lonParam) : -46.6333;

    if (isNaN(lat) || isNaN(lon)) {
      lat = -23.5505;
      lon = -46.6333;
    }

    // 1. Tentar reverse geocoding via OpenStreetMap/Nominatim para obter a cidade real
    let city = "Local Atual";
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=pt-BR`,
        {
          headers: {
            "User-Agent": "GymClub-Fitness-App/1.0",
          },
          next: { revalidate: 3600 },
        }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        city =
          address.city ||
          address.town ||
          address.municipality ||
          address.village ||
          address.suburb ||
          (latParam ? "Local Detectado" : "São Paulo");
      }
    } catch {
      city = latParam ? "Local Detectado" : "São Paulo";
    }

    // 2. Buscar dados meteorológicos em tempo real da Open-Meteo (API pública e gratuita)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`,
      { next: { revalidate: 900 } } // Cache de 15 minutos
    );

    if (!weatherRes.ok) {
      throw new Error("Falha ao consultar a API de meteorologia Open-Meteo.");
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current || {};

    const temperature = Math.round(current.temperature_2m ?? 24);
    const apparentTemp = Math.round(current.apparent_temperature ?? temperature);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const windSpeed = Math.round(current.wind_speed_10m ?? 10);
    const precipitation = current.precipitation ?? 0;
    const weatherCode = current.weather_code ?? 0;

    const weatherInfo = WEATHER_DESCRIPTIONS[weatherCode] || {
      label: "Clima Estável",
      icon: "cloud-sun",
    };

    // 3. Gerar prescrição fisiológica com IA adaptada ao clima e temperatura
    const prompt = `Você é o treinador principal e fisiologista da GymClub.
O atleta está treinando na cidade de ${city}. As condições climáticas agora são:
- Temperatura Atual: ${temperature}°C
- Sensação Térmica: ${apparentTemp}°C
- Umidade Relativa: ${humidity}%
- Velocidade do Vento: ${windSpeed} km/h
- Precipitação: ${precipitation} mm
- Condição climática: ${weatherInfo.label}

Forneça uma recomendação tática curta e sem achismo em formato JSON estrito:
{
  "recommendationTitle": "Título curto em até 6 palavras",
  "recommendedLocation": "Indoor" ou "Outdoor" ou "Indoor Climatizado",
  "warmupMinutes": 10,
  "hydrationMlPerHour": 600,
  "intensityAdjustment": "Normal (100%)" ou "-5% a -10% em cardio",
  "tacticalTip": "Dica de 1 frase direta e biomecânica para otimizar a performance hoje.",
  "idealWorkout": "Musculação Hipertrofia / Corrida Indoor / Treino Funcional / etc."
}
Responda APENAS o JSON válido, sem blocos markdown.`;

    let aiRecommendation = {
      recommendationTitle: "Treino Otimizado ao Clima",
      recommendedLocation: temperature > 30 || precipitation > 1 ? "Indoor Climatizado" : "Indoor / Outdoor",
      warmupMinutes: temperature < 18 ? 12 : 8,
      hydrationMlPerHour: temperature > 26 ? 750 : 500,
      intensityAdjustment: temperature > 32 ? "Cardio moderado (-10% pico)" : "Normal (100%)",
      tacticalTip: `Com ${temperature}°C e ${humidity}% de umidade, priorize aquecimento articular progressivo e boa taxa hídrica intra-treino.`,
      idealWorkout: precipitation > 0 ? "Musculação Indoor" : "Treino de Força e Performance",
    };

    try {
      const rawAiResponse = await askCoachAI({
        messages: [
          {
            role: "system",
            content: "Você é um treinador de elite e fisiologista esportivo da GymClub. Responda estritamente em formato JSON.",
          },
          { role: "user", content: prompt },
        ],
      });

      const cleanJson = rawAiResponse
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();
      const parsed = JSON.parse(cleanJson);
      aiRecommendation = { ...aiRecommendation, ...parsed };
    } catch {
      // Fallback gracioso com regras fisiológicas se a IA demorar ou falhar
      if (temperature >= 30) {
        aiRecommendation.tacticalTip = "Calor elevado: aumente intervalos de descanso em 20-30s e beba água gelada entre as séries.";
        aiRecommendation.hydrationMlPerHour = 800;
        aiRecommendation.recommendedLocation = "Indoor Climatizado";
      } else if (temperature <= 16) {
        aiRecommendation.tacticalTip = "Clima frio: prolongue o aquecimento dinâmico em 5 min para elevar a viscosidade do líquido sinovial.";
        aiRecommendation.warmupMinutes = 14;
      }
    }

    return NextResponse.json({
      success: true,
      city,
      temperature,
      apparentTemp,
      humidity,
      windSpeed,
      precipitation,
      conditionLabel: weatherInfo.label,
      conditionIcon: weatherInfo.icon,
      ...aiRecommendation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
