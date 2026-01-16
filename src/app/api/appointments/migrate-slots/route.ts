/**
 * Migrate old AppointmentSlot data to new WeeklySchedule system
 * POST /api/appointments/migrate-slots
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Fetch all existing appointment slots
    const oldSlots = await prisma.appointmentSlot.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    if (oldSlots.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No appointment slots found to migrate",
      });
    }

    // Group slots by day of week
    const slotsByDay: { [key: number]: typeof oldSlots } = {};
    oldSlots.forEach((slot) => {
      if (!slotsByDay[slot.dayOfWeek]) {
        slotsByDay[slot.dayOfWeek] = [];
      }
      slotsByDay[slot.dayOfWeek].push(slot);
    });

    const migrated: string[] = [];

    // Create WeeklySchedule entries for each day
    for (const [dayOfWeekStr, slots] of Object.entries(slotsByDay)) {
      const dayOfWeek = parseInt(dayOfWeekStr);

      // Check if this day already has a schedule
      const existing = await prisma.weeklySchedule.findUnique({
        where: { dayOfWeek },
      });

      if (existing) {
        console.log(
          `WeeklySchedule already exists for day ${dayOfWeek}, skipping...`
        );
        continue;
      }

      // Create WeeklySchedule with time blocks
      const weeklySchedule = await prisma.weeklySchedule.create({
        data: {
          dayOfWeek,
          enabled: slots.some((s) => s.isAvailable),
          timeBlocks: {
            create: slots.map((slot) => ({
              startTime: `${slot.startTime}:00`, // Convert HH:mm to HH:mm:ss
              endTime: `${slot.endTime}:00`,
              slotDuration: 60, // Default 60 minutes
            })),
          },
        },
        include: {
          timeBlocks: true,
        },
      });

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      migrated.push(
        `${dayNames[dayOfWeek]}: ${weeklySchedule.timeBlocks.length} time blocks`
      );
    }

    // Create default AppointmentSettings if it doesn't exist
    const settings = await prisma.appointmentSettings.findFirst();
    if (!settings) {
      await prisma.appointmentSettings.create({
        data: {
          durationMinutes: 60,
          maxAdvanceBookingDays: 90,
          minAdvanceBookingHours: 24,
        },
      });
      migrated.push("Created default AppointmentSettings");
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      migrated,
      totalDays: Object.keys(slotsByDay).length,
      totalSlots: oldSlots.length,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
