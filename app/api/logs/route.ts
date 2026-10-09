import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exerciseName = searchParams.get("exercise");

    // Se passou query ?exercise=..., busca evolução histórica desse exercício
    if (exerciseName) {
      const logs = await prisma.exerciseLog.findMany({
        where: {
          workoutLog: { userId: session.user.id },
          exerciseName: { equals: exerciseName, mode: "insensitive" },
        },
        orderBy: { createdAt: "asc" },
        include: {
          workoutLog: {
            select: { date: true, workoutName: true },
          },
        },
      });

      return NextResponse.json({ progression: logs });
    }

    // Caso contrário, busca os logs gerais de treinos realizados
    const logs = await prisma.workoutLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        exerciseLogs: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Erro ao listar logs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de treinos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      workoutId,
      workoutName,
      durationMinutes,
      perceivedEffort,
      notes,
      exercises,
    } = body;

    if (!workoutName) {
      return NextResponse.json(
        { error: "Nome do treino é obrigatório" },
        { status: 400 }
      );
    }

    // Cria o WorkoutLog
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        workoutId: workoutId || null,
        workoutName: workoutName.trim(),
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        perceivedEffort: perceivedEffort ? parseInt(perceivedEffort, 10) : null,
        notes: notes?.trim() || null,
      },
    });

    // Cria os ExerciseLogs
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        const setsDataArray = Array.isArray(ex.sets) ? ex.sets : [];
        let maxWeight = 0;
        let totalVolume = 0;

        for (const s of setsDataArray) {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps, 10) || 0;
          if (w > maxWeight) maxWeight = w;
          totalVolume += w * r;
        }

        await prisma.exerciseLog.create({
          data: {
            workoutLogId: workoutLog.id,
            exerciseId: ex.exerciseId || null,
            exerciseName: ex.exerciseName || "Exercício",
            setsData: JSON.stringify(setsDataArray),
            maxWeight,
            totalVolume,
            notes: ex.notes || null,
          },
        });

        // Se o exercício está vinculado a um modelo e a carga máxima foi superior, atualiza a referência
        if (ex.exerciseId && maxWeight > 0) {
          await prisma.exercise
            .update({
              where: { id: ex.exerciseId },
              data: { weight: maxWeight },
            })
            .catch(() => {
              // Silencioso se o exercício original foi excluído
            });
        }
      }
    }

    const fullLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLog.id },
      include: { exerciseLogs: true },
    });

    return NextResponse.json({ workoutLog: fullLog }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar log de treino:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar treino executado" },
      { status: 500 }
    );
  }
}
