import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit: máximo 5 tentativas a cada 10 minutos por IP
    const rateLimit = checkRateLimit(req, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
      prefix: "auth:register",
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { name, email, password, targetGoal, currentWeight, height } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Validação básica de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Formato de e-mail inválido." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // 2. Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado. Tente fazer login." },
          { status: 409 }
        );
      } else {
        // Usuário existe mas ainda não verificou: atualiza a senha e reenvia código
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name.trim(),
            password: hashedPassword,
            targetGoal: targetGoal || "HIPERTROFIA",
            currentWeight: currentWeight ? parseFloat(currentWeight) : null,
            height: height ? parseFloat(height) : null,
          },
        });

        // Gera novo código
        const code = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        // Remove tokens antigos do usuário
        await prisma.verificationToken.deleteMany({
          where: { identifier: cleanEmail },
        });

        await prisma.verificationToken.create({
          data: {
            identifier: cleanEmail,
            token: code,
            type: "EMAIL_VERIFICATION",
            expires,
            userId: existingUser.id,
          },
        });

        try {
          await sendVerificationEmail({
            email: cleanEmail,
            name: name.trim(),
            code,
            verifyUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?email=${encodeURIComponent(cleanEmail)}&code=${code}`,
          });
        } catch (mailError) {
          console.error("Erro ao enviar e-mail com nodemailer:", mailError);
        }

        return NextResponse.json({
          success: true,
          message: "Conta atualizada! Enviamos um novo código de verificação para o seu e-mail.",
          email: cleanEmail,
          requiresVerification: true,
        });
      }
    }

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Criação do usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        targetGoal: targetGoal || "HIPERTROFIA",
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        height: height ? parseFloat(height) : null,
      },
    });

    // 5. Criar token de verificação de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: code,
        type: "EMAIL_VERIFICATION",
        expires,
        userId: user.id,
      },
    });

    // 6. Enviar e-mail com Nodemailer
    try {
      await sendVerificationEmail({
        email: cleanEmail,
        name: user.name,
        code,
        verifyUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?email=${encodeURIComponent(cleanEmail)}&code=${code}`,
      });
    } catch (mailError) {
      console.error("Erro ao enviar e-mail pelo nodemailer:", mailError);
      // Não trava o fluxo se o SMTP falhar, mas alerta no retorno
    }

    return NextResponse.json({
      success: true,
      message: "Cadastro realizado com sucesso! Enviamos um código para seu e-mail.",
      email: cleanEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao realizar o cadastro." },
      { status: 500 }
    );
  }
}
