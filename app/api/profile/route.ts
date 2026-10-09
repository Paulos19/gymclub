import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        targetGoal: true,
        currentWeight: true,
        height: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            workouts: true,
            workoutLogs: true,
            progressPhotos: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const name = formData.get("name") as string | null;
      const bio = formData.get("bio") as string | null;
      const targetGoal = formData.get("targetGoal") as string | null;
      const currentWeight = formData.get("currentWeight") as string | null;
      const height = formData.get("height") as string | null;

      let imageUrl: string | undefined = undefined;

      if (file && file.size > 0) {
        const uploaded = await saveUploadedFile(file, "profiles");
        imageUrl = uploaded.url;
      }

      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(bio !== null ? { bio: bio?.trim() } : {}),
          ...(targetGoal ? { targetGoal } : {}),
          ...(currentWeight ? { currentWeight: parseFloat(currentWeight) } : {}),
          ...(height ? { height: parseFloat(height) } : {}),
          ...(imageUrl ? { image: imageUrl } : {}),
        },
      });

      return NextResponse.json({ user: updated });
    } else {
      const body = await req.json();
      const { name, bio, targetGoal, currentWeight, height } = body;

      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(bio !== null ? { bio: bio?.trim() } : {}),
          ...(targetGoal ? { targetGoal } : {}),
          ...(currentWeight !== undefined
            ? { currentWeight: currentWeight ? parseFloat(currentWeight) : null }
            : {}),
          ...(height !== undefined
            ? { height: height ? parseFloat(height) : null }
            : {}),
        },
      });

      return NextResponse.json({ user: updated });
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil" },
      { status: 500 }
    );
  }
}
