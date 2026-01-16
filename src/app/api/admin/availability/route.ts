import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all availability blocks
export async function GET() {
  try {
    const availability = await prisma.availabilityBlock.findMany({
      include: {
        timeBlocks: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST new availability block for a date
export async function POST(request: NextRequest) {
  try {
    const { date, blocks } = await request.json();

    if (!date || !blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, message: "Invalid data format" },
        { status: 400 }
      );
    }

    // Validate blocks have required fields
    for (const block of blocks) {
      if (!block.startTime || !block.endTime || !block.durationMinutes) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each block must have startTime, endTime, and durationMinutes",
          },
          { status: 400 }
        );
      }
    }

    // Check if date already has availability
    const existing = await prisma.availabilityBlock.findUnique({
      where: { date: new Date(date) },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability already exists for this date",
        },
        { status: 400 }
      );
    }

    // Create availability block with time blocks
    const availability = await prisma.availabilityBlock.create({
      data: {
        date: new Date(date),
        timeBlocks: {
          create: blocks.map((block: any) => ({
            startTime: block.startTime,
            endTime: block.endTime,
            durationMinutes: block.durationMinutes,
          })),
        },
      },
      include: {
        timeBlocks: true,
      },
    });

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create availability" },
      { status: 500 }
    );
  }
}

// DELETE availability for a specific date
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date is required" },
        { status: 400 }
      );
    }

    // Check if there are any booked appointments for this date
    const bookedAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: new Date(date),
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (bookedAppointments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete availability. ${bookedAppointments} appointment(s) already booked for this date.`,
        },
        { status: 400 }
      );
    }

    await prisma.availabilityBlock.delete({
      where: { date: new Date(date) },
    });

    return NextResponse.json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
