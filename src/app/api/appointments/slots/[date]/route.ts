/**
 * API Route: Get Available Time Slots for a Specific Date
 * GET /api/appointments/slots
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, parse } from "date-fns";
import {
  generateDaySlots,
  markBookedSlots,
  filterPastSlots,
  timeToSeconds,
} from "@/lib/bookingHelpers";
import type { TimeSlotInfo } from "@/types/booking";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD format

    if (!dateStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Date parameter is required",
        },
        { status: 400 }
      );
    }

    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const dayOfWeek = date.getDay();

    // Check for daily override
    const dailyAvailability = await prisma.dailyAvailability.findUnique({
      where: { date },
      include: { timeBlocks: true },
    });

    let timeBlocks: {
      startTime: string;
      endTime: string;
      slotDuration: number;
    }[] = [];
    let enabled = true;

    if (dailyAvailability) {
      enabled = dailyAvailability.enabled && !dailyAvailability.isHoliday;
      if (enabled) {
        timeBlocks = dailyAvailability.timeBlocks.map((block) => ({
          startTime: block.startTime,
          endTime: block.endTime,
          slotDuration: block.slotDuration,
        }));
      }
    } else {
      // Use weekly schedule
      const weeklySchedule = await prisma.weeklySchedule.findUnique({
        where: { dayOfWeek },
        include: { timeBlocks: true },
      });

      if (weeklySchedule && weeklySchedule.enabled) {
        timeBlocks = weeklySchedule.timeBlocks.map((block) => ({
          startTime: block.startTime,
          endTime: block.endTime,
          slotDuration: block.slotDuration,
        }));
      } else {
        enabled = false;
      }
    }

    if (!enabled) {
      return NextResponse.json({
        success: true,
        slots: [],
        date: dateStr,
        message: "No availability for this date",
      });
    }

    // Generate time slots
    let slots = generateDaySlots(timeBlocks);

    // Get bookings for this date
    const bookings = await prisma.appointment.findMany({
      where: {
        appointmentDate: date,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    const bookedSlots = bookings.map((b) => ({
      startSeconds: b.startSeconds,
      endSeconds: b.endSeconds,
      status: b.status,
      bookingId: b.id,
    }));

    // Mark booked slots
    slots = markBookedSlots(slots, bookedSlots);

    // Filter out past slots if it's today
    slots = filterPastSlots(slots, date);

    return NextResponse.json({
      success: true,
      slots,
      date: dateStr,
      availableCount: slots.filter((s) => s.available).length,
      totalCount: slots.length,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch time slots",
      },
      { status: 500 }
    );
  }
}
