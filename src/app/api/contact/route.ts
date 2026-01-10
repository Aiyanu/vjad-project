import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 5 submissions per hour per IP
const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    const { allowed, remaining, resetTime } = contactRateLimit(ip);

    if (!allowed) {
      const resetDate = new Date(resetTime).toLocaleString();
      return NextResponse.json(
        {
          error: "Too many contact form submissions. Please try again later.",
          resetTime: resetDate,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Send email to VJAD team
    await sendMail({
      to: "noreply@vijadprojects.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to user
    await sendMail({
      to: email,
      subject: "We received your message - VJAD Projects",
      html: `
        <h2>Thank You for Contacting Us</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and appreciate you reaching out to us. Our team will review your inquiry and get back to you within 24 hours.</p>
        <p><strong>Your Message Details:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Best regards,<br>VJAD Projects Team</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
