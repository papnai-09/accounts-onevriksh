import nodemailer from "nodemailer";

// Soft check for SMTP config without throwing top-level build errors
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: user ? { user, pass } : undefined,
  });
}

const transporter = getSmtpTransporter();

const FROM = `"Onevriksh Accounts" <${process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@onevriksh.in"}>`;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://accounts.onevriksh.in";

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
        © ${new Date().getFullYear()} Onevriksh Inc. · 
        <a href="${BASE_URL}/privacy" style="color:#0f766e;text-decoration:none;">Privacy</a> · 
        <a href="${BASE_URL}/terms" style="color:#0f766e;text-decoration:none;">Terms</a>
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
  const link = `${BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your Onevriksh email address",
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Verify your email</h2>
      <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, click the button below to verify your email address and activate your account.</p>
      <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Verify Email Address
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Link expires in 24 hours. Or copy: ${link}</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
  const link = `${BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your Onevriksh password",
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h2>
      <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, we received a request to reset your password. Click below to set a new one.</p>
      <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Reset Password
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This link expires in 1 hour. If you didn't request this, your account is safe — someone may have mistyped their email.</p>
    `),
  });
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Welcome to Onevriksh!",
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Welcome aboard, ${firstName}! 🎉</h2>
      <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Your Onevriksh account is ready. One account gives you access to our entire ecosystem:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#475569;line-height:2;">
        <li>📚 <strong>study.onevriksh.in</strong> — Study Hub</li>
        <li>✈️ <strong>travel.onevriksh.in</strong> — Travel Portal</li>
        <li>📊 <strong>crm.onevriksh.in</strong> — CRM Suite</li>
        <li>🎓 <strong>academy.onevriksh.in</strong> — Academy (coming soon)</li>
      </ul>
      <a href="${BASE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Go to Dashboard
      </a>
    `),
  });
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });
}

export function renderEmailVerificationTemplate(firstName: string, verifyUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Verify your email</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, click the button below to verify your email address and activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      Verify Email Address
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Link expires in 24 hours. Or copy: ${verifyUrl}</p>
  `);
}

export function renderPasswordResetTemplate(firstName: string, resetUrl: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h2>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;">Hi ${firstName}, we received a request to reset your password. Click below to set a new one.</p>
    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#16a34a);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      Reset Password
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This link expires in 1 hour.</p>
  `);
}

export function renderPasswordChangedTemplate(firstName: string, timeStr: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Password Changed</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, your password was changed on ${timeStr}.</p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">If you did not initiate this change, please reset your password immediately.</p>
  `);
}

export function renderAccountDeletedTemplate(firstName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Account Closed</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, your Onevriksh account has been closed as requested.</p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">Thank you for using Onevriksh.</p>
  `);
}

export function renderLoginAlertTemplate(firstName: string, deviceStr: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">New Login Detected</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, a new login was detected on ${deviceStr}.</p>
  `);
}

export function renderWelcomeTemplate(firstName: string): string {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Welcome to Onevriksh!</h2>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${firstName}, your account is now ready to use.</p>
  `);
}
