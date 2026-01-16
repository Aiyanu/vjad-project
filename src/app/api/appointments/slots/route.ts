import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Get all appointment slot settings (global availability)
 */
export async function GET() {
  try {
    const slots = await prisma.appointmentSlot.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Group slots by day
    const slotsByDay = daysOfWeek.reduce((acc, day, index) => {
      acc[index] = {
        dayName: day,
        slots: slots.filter((s) => s.dayOfWeek === index),
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      slots,
      slotsByDay,
    });
  } catch (error: any) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slots", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create or update appointment slot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isAvailable } = body;

    // Validate
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: dayOfWeek, startTime, endTime" },
        { status: 400 }
      );
    }

    // Create or update
    const slot = await prisma.appointmentSlot.upsert({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek,
          startTime,
          endTime,
        },
      },
      update: {
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      create: {
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment slot saved",
      slot,
    });
  } catch (error: any) {
    console.error("Error saving slot:", error);
    return NextResponse.json(
      { error: "Failed to save appointment slot", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete appointment slot
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: "slotId is required" },
        { status: 400 }
      );
    }

    await prisma.appointmentSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment slot deleted",
    });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment slot", details: error.message },
      { status: 500 }
    );
  }
}
