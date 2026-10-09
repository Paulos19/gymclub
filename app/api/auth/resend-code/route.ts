import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, {
      limit: 3,
      windowMs: 5 * 60 * 1000,
      prefix: "auth:resend",
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nenhum usuário encontrado com este e-mail." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Este e-mail já foi verificado. Você pode entrar diretamente." },
        { status: 200 }
      );
    }

    // Gera novo código
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: code,
        type: "EMAIL_VERIFICATION",
        expires,
        userId: user.id,
      },
    });

    await sendVerificationEmail({
      email: cleanEmail,
      name: user.name,
      code,
      verifyUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?email=${encodeURIComponent(cleanEmail)}&code=${code}`,
    });

    return NextResponse.json({
      success: true,
      message: "Novo código enviado com sucesso para o seu e-mail!",
    });
  } catch (error) {
    console.error("Erro ao reenviar código:", error);
    return NextResponse.json(
      { error: "Erro ao processar o reenvio de código." },
      { status: 500 }
    );
  }
}
