import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET appointment duration setting
export async function GET() {
  try {
    const settings = await prisma.appointmentSettings.findFirst();

    return NextResponse.json({
      success: true,
      duration: settings?.durationMinutes || 60,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST/UPDATE appointment duration setting
export async function POST(request: NextRequest) {
  try {
    const { durationMinutes } = await request.json();

    if (!durationMinutes || durationMinutes < 15) {
      return NextResponse.json(
        { success: false, message: "Duration must be at least 15 minutes" },
        { status: 400 }
      );
    }

    const settings = await prisma.appointmentSettings.upsert({
      where: { id: 1 },
      update: { durationMinutes },
      create: { id: 1, durationMinutes },
    });

    return NextResponse.json({
      success: true,
      duration: settings.durationMinutes,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
