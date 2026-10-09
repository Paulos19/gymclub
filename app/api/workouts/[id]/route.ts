import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const workout = await prisma.workout.findFirst({
      where: { id, userId: session.user.id },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error("Erro ao buscar detalhes do treino:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const workout = await prisma.workout.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }

    // Marca como arquivado para preservar logs históricos
    await prisma.workout.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar treino:", error);
    return NextResponse.json(
      { error: "Erro ao excluir treino" },
      { status: 500 }
    );
  }
}
