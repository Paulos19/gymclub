export interface ChatMessageInput {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AthleteContext {
  name?: string | null;
  targetGoal?: string | null;
  currentWeight?: number | null;
  height?: number | null;
  recentWorkouts?: string[];
}

const LLM_BASE_URL = process.env.LLM_BASE_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || "combo-1";

export async function askCoachAI({
  messages,
  context,
}: {
  messages: ChatMessageInput[];
  context?: AthleteContext;
}): Promise<string> {
  if (!LLM_BASE_URL || !LLM_API_KEY) {
    throw new Error("As variáveis LLM_BASE_URL e LLM_API_KEY não estão configuradas no .env.");
  }
  const systemPrompt = `Você é o "GymClub Coach AI", o treinador de inteligência artificial de elite da plataforma GymClub.
Sua missão é guiar atletas de todos os níveis a alcançarem a melhor versão física e mental com disciplina inabalável, ciência esportiva e periodização inteligente.

DIRETRIZES:
1. Conhecimento técnico: Você domina biomecânica, hipertrofia, força, periodização de treino (ABC, ABCD, ABCDE, Upper/Lower, PPL, Full Body), progressão de carga (RPE, progressão linear e ondulatória) e descanso adequado.
2. Tom de voz: Motivador, direto, focado na disciplina e consistência ("A motivação te faz começar, o hábito e a disciplina te mantêm no topo"). Sem enrolação.
3. Formatação: Use markdown limpo, listas com marcadores claros e tabelas quando sugerir divisões de treino ou séries/repetições/cargas.
4. Segurança: Sempre recomende boa postura e técnica antes de aumento desmedido de carga para prevenir lesões.
${
  context
    ? `
DADOS DO ATLETA ATUAL:
- Nome: ${context.name || "Atleta"}
- Objetivo principal: ${context.targetGoal || "Hipertrofia e Performance"}
- Peso corporal: ${context.currentWeight ? `${context.currentWeight} kg` : "Não informado"}
- Altura: ${context.height ? `${context.height} cm` : "Não informada"}
`
    : ""
}`;

  const fullMessages: ChatMessageInput[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const endpoint = `${LLM_BASE_URL.replace(/\/+$/, "")}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1200,
      stream: false, // Força resposta não-stream do provedor
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Falha na comunicação com o provedor de IA (${response.status}): ${errorText}`
    );
  }

  const rawText = await response.text();

  // Caso 1: O Nine Router retornou stream SSE (começando com "data: ")
  if (rawText.trim().startsWith("data:")) {
    const lines = rawText.split("\n");
    let accumulatedText = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;

      if (trimmed.startsWith("data:")) {
        const jsonStr = trimmed.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(jsonStr);
          const chunk =
            parsed.choices?.[0]?.delta?.content ||
            parsed.choices?.[0]?.message?.content ||
            "";
          accumulatedText += chunk;
        } catch {
          // Ignora pedaços intermediários não finalizados
        }
      }
    }

    if (accumulatedText.trim()) {
      return accumulatedText.trim();
    }
  }

  // Caso 2: Resposta JSON tradicional padrão OpenAI
  try {
    const data = JSON.parse(rawText);
    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.delta?.content;

    if (reply) {
      return reply;
    }
  } catch (err) {
    console.error("Erro ao converter resposta em JSON:", err, "Raw:", rawText.slice(0, 200));
  }

  throw new Error("Não foi possível extrair a resposta do modelo da IA.");
}
