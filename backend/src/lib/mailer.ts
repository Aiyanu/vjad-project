import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("Mailer not fully configured (SMTP_* env vars missing)");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // Namecheap: use false for port 587 (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false, // Accept self-signed certs (optional, for dev)
    },
    connectionTimeout: 10000, // 10s timeout
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
  const mailFrom =
    process.env.MAIL_FROM ||
    `no-reply@${process.env.APP_DOMAIN || "example.com"}`;

  if (!t) {
    console.log("Mailer not configured. Mail content below:", {
      to,
      subject,
      text,
      html,
    });
    return {
      ok: true,
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
    return { ok: true, info };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
}

export default { sendMail };
