import nodemailer from "nodemailer";
import crypto from "node:crypto";

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!smtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!.replace(/\s+/g, ""),
    },
  });
}

function fromAddress() {
  return (
    process.env.MAIL_FROM ||
    `Seedqura <${process.env.SMTP_USER || "hello@seedqura.in"}>`
  );
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3020"
  );
}

export function isMailConfigured() {
  return smtpConfigured();
}

/** Readable temp password for student welcome emails */
export function generateTempPassword(length = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out + "!";
}

export async function sendMail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[mail] SMTP not configured — skipping send:", input.subject);
    return { ok: false as const, skipped: true as const };
  }

  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html || input.text.replace(/\n/g, "<br/>"),
    replyTo: input.replyTo,
  });

  return { ok: true as const, skipped: false as const };
}

export async function sendStudentWelcomeEmail(input: {
  to: string;
  name: string;
  password: string;
  courseName?: string;
}) {
  const base = siteUrl().replace(/\/$/, "");
  const loginUrl = `${base}/login`;
  const dashboardUrl = `${base}/student`;
  const courseName = input.courseName || "your Seedqura course";

  const text = [
    `Hi ${input.name},`,
    "",
    "Welcome to Seedqura — your payment was successful and your student account is ready.",
    "",
    `Course: ${courseName}`,
    "",
    "Your login credentials:",
    `Email: ${input.to}`,
    `Temporary password: ${input.password}`,
    "",
    `Login: ${loginUrl}`,
    `Student dashboard: ${dashboardUrl}`,
    "",
    "For security, please change your password after you sign in (use Forgot password on the login page if needed).",
    "",
    "If you did not enroll with Seedqura, please ignore this email.",
    "",
    "— Team Seedqura",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Seedqura</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:Georgia,'Times New Roman',serif;color:#1a1f1c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5ebe8;">
          <tr>
            <td style="background:#0f766e;padding:28px 32px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b7ebe4;font-family:Arial,sans-serif;">Seedqura</p>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:500;color:#ffffff;line-height:1.25;">Welcome — your account is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(input.name)},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3d4742;">
                Payment received. You are enrolled in
                <strong style="color:#1a1f1c;">${escapeHtml(courseName)}</strong>
                and can access your student dashboard now.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f7faf8;border-radius:12px;border:1px solid #e5ebe8;">
                <tr>
                  <td style="padding:20px 22px;font-family:Arial,sans-serif;">
                    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b756f;">Your login credentials</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#3d4742;">
                      <strong style="color:#1a1f1c;">Email</strong><br/>
                      <span style="font-size:15px;">${escapeHtml(input.to)}</span>
                    </p>
                    <p style="margin:16px 0 0;font-size:14px;color:#3d4742;">
                      <strong style="color:#1a1f1c;">Temporary password</strong><br/>
                      <code style="display:inline-block;margin-top:6px;padding:8px 12px;background:#ffffff;border:1px solid #d8e0dc;border-radius:8px;font-size:16px;letter-spacing:0.04em;color:#0f766e;">${escapeHtml(input.password)}</code>
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
                <tr>
                  <td style="border-radius:999px;background:#0f766e;">
                    <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:12px 22px;font-family:Arial,sans-serif;font-size:14px;color:#ffffff;text-decoration:none;">Sign in to Seedqura</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#3d4742;font-family:Arial,sans-serif;">
                After login you will land on your student dashboard:<br/>
                <a href="${escapeHtml(dashboardUrl)}" style="color:#0f766e;">${escapeHtml(dashboardUrl)}</a>
              </p>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b756f;font-family:Arial,sans-serif;">
                Please change this temporary password after your first login. If you did not enroll with Seedqura, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 28px;border-top:1px solid #e5ebe8;font-family:Arial,sans-serif;font-size:12px;color:#8a938e;">
              — Team Seedqura
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendMail({
    to: input.to,
    subject: `Welcome to Seedqura — your login for ${courseName}`,
    text,
    html,
  });
}

/** @deprecated use sendStudentWelcomeEmail */
export async function sendSetPasswordEmail(input: {
  to: string;
  name: string;
  setPasswordUrl: string;
  courseName?: string;
}) {
  const base = siteUrl().replace(/\/$/, "");
  return sendMail({
    to: input.to,
    subject: "Set your Seedqura student password",
    text: [
      `Hi ${input.name},`,
      "",
      "Payment received — your Seedqura student account is ready.",
      input.courseName
        ? `You are enrolled in ${input.courseName}.`
        : "Your Seedqura enrollment is confirmed.",
      "",
      "Set your password using this link:",
      input.setPasswordUrl,
      "",
      `Then sign in at ${base}/login`,
      "",
      "— Seedqura",
    ].join("\n"),
  });
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.MAIL_TO || process.env.SMTP_USER || "hello@seedqura.in";
  return sendMail({
    to,
    subject: `[Contact] ${input.subject} — ${input.name}`,
    replyTo: input.email,
    text: [
      `New contact form message`,
      "",
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Subject: ${input.subject}`,
      "",
      input.message,
    ].join("\n"),
  });
}

export async function sendApplicationNotification(input: {
  name: string;
  email: string;
  phone: string;
  courseName: string;
  institution: string;
}) {
  const to = process.env.MAIL_TO || process.env.SMTP_USER || "hello@seedqura.in";
  return sendMail({
    to,
    subject: `[Application] ${input.courseName} — ${input.name}`,
    replyTo: input.email,
    text: [
      `New course application`,
      "",
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Institution: ${input.institution}`,
      `Course: ${input.courseName}`,
    ].join("\n"),
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
