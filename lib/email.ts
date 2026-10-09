import nodemailer from "nodemailer";

const host = process.env.EMAIL_SERVER_HOST || "smtp.gmail.com";
const port = parseInt(process.env.EMAIL_SERVER_PORT || "465", 10);
const secure = process.env.EMAIL_SERVER_SECURE === "true";
const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
const from = process.env.EMAIL_FROM || "GymClub <no-reply@gymclub.com>";

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
});

export async function sendVerificationEmail({
  email,
  name,
  code,
  verifyUrl,
}: {
  email: string;
  name?: string | null;
  code: string;
  verifyUrl?: string;
}) {
  const athleteName = name || "Atleta";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirme seu e-mail no GymClub</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          color: #f1f5f9;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 540px;
          margin: 0 auto;
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #000000;
          text-transform: uppercase;
        }
        .tagline {
          color: #1f2937;
          font-size: 13px;
          font-weight: 600;
          margin-top: 4px;
          letter-spacing: 1px;
        }
        .content {
          padding: 36px 30px;
        }
        h2 {
          color: #ffffff;
          font-size: 22px;
          margin-top: 0;
          margin-bottom: 16px;
        }
        p {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .code-box {
          background: #030712;
          border: 2px dashed #f59e0b;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 28px 0;
        }
        .code-label {
          font-size: 12px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .code-number {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #f59e0b;
          font-family: monospace;
        }
        .btn {
          display: inline-block;
          background: #f59e0b;
          color: #000000 !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 10px;
          text-align: center;
          margin: 12px 0 24px 0;
        }
        .footer {
          border-top: 1px solid #1f2937;
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ GymClub</div>
          <div class="tagline">Evolução, Disciplina e Performance</div>
        </div>
        <div class="content">
          <h2>Bem-vindo ao time, ${athleteName}!</h2>
          <p>Você está a um passo de desbloquear o controle total dos seus treinos, evolução de cargas e o seu Treinador IA dedicado.</p>
          <p>Para confirmar seu endereço de e-mail e ativar sua conta, utilize o código de verificação abaixo:</p>
          
          <div class="code-box">
            <div class="code-label">Seu código de verificação</div>
            <div class="code-number">${code}</div>
          </div>

          ${
            verifyUrl
              ? `<div style="text-align: center;">
                  <a href="${verifyUrl}" class="btn">Confirmar E-mail Diretamente</a>
                </div>`
              : ""
          }

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            Este código expira em 30 minutos. Se você não solicitou este cadastro no GymClub, ignore esta mensagem.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GymClub Platform. Todos os direitos reservados.
        </div>
      </div>
    </body>
  </html>
  `;

  return transporter.sendMail({
    from,
    to: email,
    subject: `⚡ ${code} é o seu código de verificação GymClub`,
    text: `Olá ${athleteName}! Seu código de verificação GymClub é: ${code}. Válido por 30 minutos.`,
    html,
  });
}

export async function sendPasswordResetEmail({
  email,
  name,
  code,
  resetUrl,
}: {
  email: string;
  name?: string | null;
  code: string;
  resetUrl: string;
}) {
  const athleteName = name || "Atleta";

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperação de Senha - GymClub</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
        .header { background: #f59e0b; padding: 24px; text-align: center; color: #000; font-weight: 800; font-size: 24px; }
        .content { padding: 32px; }
        .btn { display: inline-block; background: #f59e0b; color: #000; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">GymClub • Recuperação de Senha</div>
        <div class="content">
          <h3>Olá, ${athleteName}</h3>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no GymClub.</p>
          <p>Código de segurança: <strong>${code}</strong></p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" class="btn">Redefinir Minha Senha</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">Se não foi você que solicitou, sua conta continua segura e você pode ignorar este e-mail.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  return transporter.sendMail({
    from,
    to: email,
    subject: `Recuperação de acesso à sua conta GymClub`,
    text: `Olá ${athleteName}. Para redefinir sua senha, acesse: ${resetUrl} ou use o código: ${code}`,
    html,
  });
}
