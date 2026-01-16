import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

/**
 * Get appointment data for a calendar month
 * Shows booked dates and available dates
 * Query params: ?month=2026-01 or ?month=1&year=2026
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get("month"); // YYYY-MM format
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    let targetDate: Date;

    if (monthStr) {
      targetDate = new Date(`${monthStr}-01`);
    } else if (month && year) {
      targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    } else {
      targetDate = new Date();
    }

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

    // Get booked appointments for this month
    const bookedAppointments = await prisma.appointmentBooking.findMany({
      where: {
        appointmentDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    // Get available slots setup
    const availableSlots = await prisma.appointmentSlot.findMany({
      where: {
        isAvailable: true,
      },
    });

    // Create availability map
    const availabilityMap: {
      [key: string]: {
        date: string;
        dayOfWeek: number;
        status: "available" | "booked" | "unavailable";
        bookedCount: number;
      };
    } = {};

    daysInMonth.forEach((day) => {
      const dayOfWeek = day.getDay();
      const dateStr = day.toISOString().split("T")[0];
      const dayBooked = bookedAppointments.filter((a) => {
        const bookedDate = a.appointmentDate.toISOString().split("T")[0];
        return bookedDate === dateStr;
      });

      const hasAvailableSlot = availableSlots.some(
        (s) => s.dayOfWeek === dayOfWeek
      );
      const isFullyBooked =
        hasAvailableSlot &&
        dayBooked.length >=
          availableSlots.filter((s) => s.dayOfWeek === dayOfWeek).length;

      availabilityMap[dateStr] = {
        date: dateStr,
        dayOfWeek,
        status: !hasAvailableSlot
          ? "unavailable"
          : isFullyBooked
          ? "booked"
          : "available",
        bookedCount: dayBooked.length,
      };
    });

    return NextResponse.json({
      success: true,
      month: targetDate.toISOString().split("T")[0].substring(0, 7),
      availability: availabilityMap,
      totalBooked: bookedAppointments.length,
    });
  } catch (error: any) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data", details: error.message },
      { status: 500 }
    );
  }
}
