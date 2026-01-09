import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  try {
    const result = await sendMail({
      to: process.env.SMTP_USER || "test@example.com", // Send to yourself
      subject: "Test Email from Vijad Projects",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #0046FF;">Test Email</h1>
          <p>This is a test email from Vijad Projects.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
      text: "This is a test email from Vijad Projects. If you received this, your email configuration is working correctly!",
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      details: result,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
