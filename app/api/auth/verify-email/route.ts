import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, {
      limit: 10,
      windowMs: 5 * 60 * 1000,
      prefix: "auth:verify-email",
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "E-mail e código de verificação são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // Busca o token ativo
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,
        token: cleanCode,
        type: "EMAIL_VERIFICATION",
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Código de verificação incorreto ou inválido." },
        { status: 400 }
      );
    }

    if (new Date() > tokenRecord.expires) {
      return NextResponse.json(
        { error: "Este código expirou. Solicite um novo código." },
        { status: 400 }
      );
    }

    // Marca o e-mail do usuário como verificado
    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        emailVerified: new Date(),
      },
    });

    // Remove os tokens associados a esse e-mail
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: "E-mail verificado com sucesso! Você já pode entrar na sua conta.",
    });
  } catch (error) {
    console.error("Erro na verificação de e-mail:", error);
    return NextResponse.json(
      { error: "Erro interno ao validar o código." },
      { status: 500 }
    );
  }
}
