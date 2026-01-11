import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Verify bank account using Paystack Resolve Account API
export async function POST(req: NextRequest) {
  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "Account number and bank code are required" },
        { status: 400 }
      );
    }

    if (accountNumber.length !== 10) {
      return NextResponse.json(
        { error: "Account number must be 10 digits" },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment verification not configured" },
        { status: 500 }
      );
    }

    // Call Paystack Resolve Account endpoint
    const paystackUrl = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
    const paystackRes = await fetch(paystackUrl, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const json = await paystackRes.json();

    if (!paystackRes.ok || !json.status) {
      return NextResponse.json(
        { error: json.message || "Could not verify account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      accountName: json.data.account_name,
      accountNumber: json.data.account_number,
      bankCode,
    });
  } catch (error: any) {
    console.error("Account verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
