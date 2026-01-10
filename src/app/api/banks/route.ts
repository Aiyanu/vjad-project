import { NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response-server";

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
    const [response, status] = apiSuccess(
      json.data || [],
      "Banks fetched",
      200
    );
    return NextResponse.json(response, { status });
  } catch (error) {
    const [response, status] = apiError("Could not load banks", 500, error);
    return NextResponse.json(response, { status });
  }
}
