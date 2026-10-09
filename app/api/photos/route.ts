import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const photos = await prisma.progressPhoto.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Erro ao listar fotos de progresso:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar fotos" },
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dateStr = formData.get("date") as string | null;
    const weightStr = formData.get("weight") as string | null;
    const pose = (formData.get("pose") as string) || "FRENTE";
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhuma imagem foi enviada." },
        { status: 400 }
      );
    }

    // Salva o arquivo no volume EasyPanel da VPS
    const { url: imageUrl } = await saveUploadedFile(file, "progress");

    const date = dateStr ? new Date(dateStr) : new Date();
    const weight = weightStr ? parseFloat(weightStr) : null;

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: session.user.id,
        imageUrl,
        date,
        weight,
        pose,
        notes: notes?.trim() || null,
      },
    });

    // Se informou peso, registra no histórico de pesagem e atualiza o usuário
    if (weight) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { currentWeight: weight },
      });

      await prisma.weightRecord.create({
        data: {
          userId: session.user.id,
          weight,
          date,
          notes: `Foto de progresso (${pose})`,
        },
      });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao fazer upload da foto de progresso:", error);
    const message = error instanceof Error ? error.message : "Erro no upload";
    return NextResponse.json({ error: message }, { status: 500 });
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
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    const photo = await prisma.progressPhoto.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Foto não encontrada" },
        { status: 404 }
      );
    }

    // Deleta do disco
    await deleteUploadedFile(photo.imageUrl);

    // Deleta do banco
    await prisma.progressPhoto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar foto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir foto" },
      { status: 500 }
    );
  }
}
