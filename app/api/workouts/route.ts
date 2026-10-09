import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar treinos" },
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
    const { name, type, description, dayOfWeek, muscleGroups, targetGroup, exercises } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome do treino é obrigatório" },
        { status: 400 }
      );
    }

    // dayOfWeek no schema do Prisma é String? (Ex: "1", "SEGUNDA", etc.)
    const formattedDayOfWeek =
      dayOfWeek !== undefined && dayOfWeek !== null && dayOfWeek !== ""
        ? String(dayOfWeek)
        : null;

    const resolvedMuscleGroups =
      (muscleGroups || targetGroup || "")?.toString().trim() || null;

    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type: type || "MUSCULAÇÃO",
        description: description?.trim() || null,
        dayOfWeek: formattedDayOfWeek,
        muscleGroups: resolvedMuscleGroups,
        exercises: {
          create: (exercises || []).map(
            (
              ex: {
                name: string;
                muscleGroup?: string;
                sets?: number;
                reps?: string;
                weight?: number;
                restSeconds?: number;
                notes?: string;
              },
              idx: number
            ) => ({
              name: ex.name,
              muscleGroup: ex.muscleGroup || null,
              sets: Number(ex.sets) || 4,
              reps: ex.reps || "8-12",
              weight: Number(ex.weight) || 0,
              restSeconds: Number(ex.restSeconds) || 90,
              notes: ex.notes || null,
              order: idx,
            })
          ),
        },
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar treino" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const workout = await prisma.workout.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!workout) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    await prisma.workout.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ message: "Treino arquivado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar treino:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
