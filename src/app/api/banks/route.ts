import { NextResponse } from "next/server";

// Fetch banks from Paystack API (free, no auth required)
export async function GET() {
  try {
    const res = await fetch("https://api.paystack.co/bank?country=nigeria", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error("Failed to fetch banks from Paystack");
    }

    const json = await res.json();
    return NextResponse.json({ banks: json.data || [] });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Could not load banks", banks: [] },
      { status: 500 }
    );
  }
}
