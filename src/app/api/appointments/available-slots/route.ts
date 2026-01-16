import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET available slots for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { success: false, message: "Date is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);

    // Get availability for this date
    const availability = await prisma.availabilityBlock.findUnique({
      where: { date },
      include: {
        timeBlocks: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!availability) {
      return NextResponse.json({
        success: true,
        slots: [],
      });
    }

    // Get booked appointments for this date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: date,
        status: {
          in: ["pending", "confirmed"],
        },
      },
      select: {
        startTime: true,
      },
    });

    // Generate slots from time blocks using each block's duration
    const slots: any[] = [];

    availability.timeBlocks.forEach((block) => {
      const [startHour, startMinute] = block.startTime.split(":").map(Number);
      const [endHour, endMinute] = block.endTime.split(":").map(Number);

      // Use the block's specific duration
      const blockDuration = block.durationMinutes;

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const slotStartTime = `${currentHour
          .toString()
          .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`;

        // Calculate end time based on this block's duration
        let slotEndMinute = currentMinute + blockDuration;
        let slotEndHour = currentHour;

        if (slotEndMinute >= 60) {
          slotEndHour += Math.floor(slotEndMinute / 60);
          slotEndMinute = slotEndMinute % 60;
        }

        const slotEndTime = `${slotEndHour
          .toString()
          .padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}:00`;

        // Don't create slot if end time exceeds block end time
        if (
          slotEndHour > endHour ||
          (slotEndHour === endHour && slotEndMinute > endMinute)
        ) {
          break;
        }

        // Check if slot is booked
        const isBooked = bookedAppointments.some(
          (apt) => apt.startTime === slotStartTime
        );

        slots.push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          available: !isBooked,
          durationMinutes: blockDuration, // Include duration in response
        });

        // Move to next slot using block's duration
        currentMinute += blockDuration;
        if (currentMinute >= 60) {
          currentMinute = currentMinute % 60;
          currentHour++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
