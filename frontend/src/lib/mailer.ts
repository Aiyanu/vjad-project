import nodemailer from "nodemailer";

// Simple mailer utility using SMTP. Configure these env vars:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
// For a Namecheap-hosted mailbox you can use their SMTP settings. Alternatively use free SendGrid/Mailgun tiers.

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom =
  process.env.MAIL_FROM ||
  `no-reply@${process.env.NEXT_PUBLIC_APP_DOMAIN || "example.com"}`;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("Mailer not fully configured (SMTP_* env vars missing)");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // SSL for 465
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // debug: true, // Enable debug logging
    // logger: true, // Enable logger
  });

  return transporter;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const t = getTransporter();
  if (!t) {
    // In dev we log the message
    console.log("Mailer not configured. Mail content below:", {
      to,
      subject,
      text,
      html,
    });
    return {
      ok: true,
      // debug: true
    };
  }

  try {
    console.log("📧 Attempting to send email:", {
      to,
      subject,
      from: mailFrom,
    });

    const info = await t.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    console.log("📬 Response:", info.response);

    return { ok: true, info };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
}

export default { sendMail };
