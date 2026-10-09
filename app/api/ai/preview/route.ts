import { NextRequest, NextResponse } from "next/server";
import { askCoachAI } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate Limit para a demonstração pública: 10 requisições a cada 5 minutos por IP
    const rateLimit = checkRateLimit(req, {
      limit: 10,
      windowMs: 5 * 60 * 1000,
      prefix: "ai:preview",
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Por favor, digite sua dúvida ou objetivo de treino." },
        { status: 400 }
      );
    }

    // Consulta direta ao motor de IA sem expor o provedor subjacente
    const reply = await askCoachAI({
      messages: [
        {
          role: "user",
          content: message.trim(),
        },
      ],
      context: {
        name: "Atleta GymClub",
        targetGoal: "Evolução e Hipertrofia",
      },
    });

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Erro na rota pública de preview do Coach IA:", error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Não foi possível conectar ao Coach IA no momento.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
