import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || `"Onevriksh Accounts" <${process.env.SMTP_USER || "noreply@onevriksh.in"}>`;
const BASE_URL = process.env.CLIENT_URL || "http://localhost:3000";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Onevriksh</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#0f766e,#16a34a);padding:32px 40px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:18px;">🛡️</span>
        </div>
        <div>
          <div style="color:#ffffff;font-size:16px;font-weight:800;">Onevriksh</div>
          <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:-2px;">Accounts</div>
        </div>
      </div>
    </div>
    <div style="padding:40px;">
      ${content}
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        © ${new Date().getFullYear()} Onevriksh · 
        <a href="${BASE_URL}/privacy" style="color:#0f766e;text-decoration:none;">Privacy</a> · 
        <a href="${BASE_URL}/terms" style="color:#0f766e;text-decoration:none;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
}

export function renderEmailVerificationTemplate(firstName: string, verifyUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Verify your email</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, click the button below to verify your email address and activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      Verify Email Address
    </a>
  `);
}

export function renderPasswordResetTemplate(firstName: string, resetUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, click below to set a new password for your account.</p>
    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      Reset Password
    </a>
  `);
}

export function renderPasswordChangedTemplate(firstName: string, timeStr: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Password Changed</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, your password was updated on ${timeStr}.</p>
  `);
}

export function renderAccountDeletedTemplate(firstName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Account Closed</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, your Onevriksh account has been closed as requested.</p>
  `);
}
