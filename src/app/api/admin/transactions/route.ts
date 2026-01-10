import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

// Admin transactions placeholder
export async function GET(request: Request) {
  try {
    const { user, error, status } = requireAdmin(request);
    if (error) {
      const [response, httpStatus] = apiError(error, status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const transactions = [
      {
        id: "t1",
        affiliateId: "a1",
        amount: 1200,
        type: "commission",
        status: "paid",
        createdAt: new Date(),
      },
      {
        id: "t2",
        affiliateId: "a2",
        amount: 500,
        type: "referral_bonus",
        status: "pending",
        createdAt: new Date(),
      },
    ];

    const [response, httpStatus] = apiSuccess(
      transactions,
      "Transactions fetched",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
