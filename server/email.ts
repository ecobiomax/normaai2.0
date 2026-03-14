import nodemailer from "nodemailer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@pluuu.com.br";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

// Create transporter
function getTransporter() {
  if (RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: RESEND_API_KEY,
      },
    });
  }

  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // Development: log emails
  return null;
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email] Would send to ${to}:`);
    console.log(`  Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Pluuu <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1a2e;
`;

const headerHtml = `
  <div style="background: linear-gradient(135deg, #3730a3, #4f46e5); padding: 32px 40px; border-radius: 16px 16px 0 0;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 20px;">🎬</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: 700;">Pluuu</span>
    </div>
  </div>
`;

export async function sendVideoReadyEmail(
  to: string,
  name: string,
  video: { title: string; downloadUrl: string; expiresAt: Date }
) {
  const expiresFormatted = format(video.expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e;">
          🎉 Seu vídeo está pronto!
        </h1>
        <p style="color: #6b7280; margin: 0 0 24px;">Olá, ${name}!</p>
        
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
          Seu vídeo imobiliário <strong>"${video.title}"</strong> foi gerado com sucesso pela nossa IA cinematográfica.
        </p>

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            ⚠️ <strong>Atenção:</strong> Este vídeo expira em <strong>${expiresFormatted}</strong>.
            Faça o download antes dessa data.
          </p>
        </div>

        <a href="${video.downloadUrl}" style="
          display: inline-block;
          background: linear-gradient(135deg, #3730a3, #4f46e5);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          margin: 0 0 24px;
        ">
          ⬇️ Baixar Vídeo (MP4 1080p)
        </a>

        <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${video.downloadUrl}" style="color: #4f46e5; word-break: break-all;">${video.downloadUrl}</a>
        </p>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 16px 0;">
        © 2025 Pluuu • www.pluuu.com.br
      </p>
    </div>
  `;

  await sendEmail(to, `🎬 Seu vídeo "${video.title}" está pronto!`, html);
}

export async function sendSubscriptionConfirmedEmail(
  to: string,
  name: string,
  plan: { name: string; videosPerMonth: number; price: number }
) {
  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e;">
          ✅ Assinatura confirmada!
        </h1>
        <p style="color: #6b7280; margin: 0 0 24px;">Olá, ${name}!</p>
        
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
          Seu pagamento foi confirmado e o plano <strong>${plan.name}</strong> está ativo.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Plano ${plan.name}</p>
          <p style="margin: 0; color: #166534; font-size: 14px;">
            ${plan.videosPerMonth} vídeos por mês • R$ ${plan.price}/mês
          </p>
        </div>

        <a href="${process.env.APP_URL || "https://pluuu.com.br"}/dashboard/criar" style="
          display: inline-block;
          background: linear-gradient(135deg, #3730a3, #4f46e5);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
        ">
          🎬 Criar meu primeiro vídeo
        </a>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 16px 0;">
        © 2025 Pluuu • www.pluuu.com.br
      </p>
    </div>
  `;

  await sendEmail(to, `✅ Plano ${plan.name} ativado com sucesso!`, html);
}

export async function sendSubscriptionExpiredEmail(to: string, name: string) {
  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e;">
          ⚠️ Sua assinatura venceu
        </h1>
        <p style="color: #6b7280; margin: 0 0 24px;">Olá, ${name}!</p>
        
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
          Sua assinatura Pluuu venceu. Renove agora para continuar criando vídeos imobiliários profissionais.
        </p>

        <a href="${process.env.APP_URL || "https://pluuu.com.br"}/dashboard/assinatura" style="
          display: inline-block;
          background: linear-gradient(135deg, #3730a3, #4f46e5);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
        ">
          🔄 Renovar assinatura
        </a>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 16px 0;">
        © 2025 Pluuu • www.pluuu.com.br
      </p>
    </div>
  `;

  await sendEmail(to, "⚠️ Sua assinatura Pluuu venceu — Renove agora", html);
}

export async function sendVideoExpiringEmail(
  to: string,
  name: string,
  video: { title: string; downloadUrl: string; expiresAt: Date }
) {
  const expiresFormatted = format(video.expiresAt, "dd 'de' MMMM", { locale: ptBR });

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e;">
          ⏰ Seu vídeo expira em 2 dias
        </h1>
        <p style="color: #6b7280; margin: 0 0 24px;">Olá, ${name}!</p>
        
        <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
          O vídeo <strong>"${video.title}"</strong> expira em <strong>${expiresFormatted}</strong>.
          Faça o download agora antes que seja deletado automaticamente.
        </p>

        <a href="${video.downloadUrl}" style="
          display: inline-block;
          background: linear-gradient(135deg, #3730a3, #4f46e5);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
        ">
          ⬇️ Baixar Vídeo Agora
        </a>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 16px 0;">
        © 2025 Pluuu • www.pluuu.com.br
      </p>
    </div>
  `;

  await sendEmail(to, `⏰ Vídeo "${video.title}" expira em 2 dias — Baixe agora!`, html);
}
