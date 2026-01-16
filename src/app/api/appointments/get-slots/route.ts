import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

/**
 * Get available appointment slots for a given date
 * Query params: ?date=2026-01-15
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(dateStr);
    const dayOfWeek = selectedDate.getDay(); // 0-6

    // Get available slots for this day of week
    const availableSlots = await prisma.appointmentSlot.findMany({
      where: {
        dayOfWeek,
        isAvailable: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Get booked appointments for this specific date
    const bookedAppointments = await prisma.appointmentBooking.findMany({
      where: {
        appointmentDate: {
          gte: startOfDay(selectedDate),
          lte: endOfDay(selectedDate),
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    // Filter out booked time slots
    const availableTimeslots = availableSlots.filter((slot) => {
      return !bookedAppointments.some(
        (booked) => booked.startTime === slot.startTime
      );
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      dayOfWeek,
      dayName: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dayOfWeek],
      availableSlots: availableTimeslots,
      bookedCount: bookedAppointments.length,
    });
  } catch (error: any) {
    console.error("Error fetching appointment slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slots", details: error.message },
      { status: 500 }
    );
  }
}
