import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askCoachAI, ChatMessageInput } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erro ao buscar histórico de chat:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit: 20 mensagens a cada 5 minutos
    const rateLimit = checkRateLimit(req, {
      limit: 20,
      windowMs: 5 * 60 * 1000,
      prefix: "ai:chat",
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { message, contextType } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    // 2. Busca dados do usuário para enriquecer o contexto
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workouts: {
          where: { isArchived: false },
          select: { name: true, type: true, dayOfWeek: true },
        },
      },
    });

    // 3. Salva a mensagem do usuário no banco
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "user",
        content: message.trim(),
        contextType: contextType || null,
      },
    });

    // 4. Busca histórico recente de conversas para manter memória
    const pastChatRecords = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const conversationHistory: ChatMessageInput[] = pastChatRecords
      .reverse()
      .map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

    // 5. Comunica com o Nine Router na VPS
    const recentWorkoutNames = (user?.workouts || []).map(
      (w) => `${w.name} (${w.dayOfWeek || "Livre"})`
    );

    const assistantReply = await askCoachAI({
      messages: conversationHistory,
      context: {
        name: user?.name,
        targetGoal: user?.targetGoal,
        currentWeight: user?.currentWeight,
        height: user?.height,
        recentWorkouts: recentWorkoutNames,
      },
    });

    // 6. Salva a resposta da IA no banco
    const savedAssistantMsg = await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "assistant",
        content: assistantReply,
        contextType: contextType || null,
      },
    });

    return NextResponse.json({
      reply: assistantReply,
      messageId: savedAssistantMsg.id,
    });
  } catch (error: unknown) {
    console.error("Erro na rota do Chat IA:", error);
    const message =
      error instanceof Error ? error.message : "Erro na comunicação com a IA";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.chatMessage.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao limpar chat:", error);
    return NextResponse.json({ error: "Erro ao limpar histórico" }, { status: 500 });
  }
}
