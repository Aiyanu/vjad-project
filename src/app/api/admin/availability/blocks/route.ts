import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Add a time block to an existing date
export async function POST(request: NextRequest) {
  try {
    const { date, startTime, endTime, durationMinutes } = await request.json();

    if (!date || !startTime || !endTime || !durationMinutes) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const availability = await prisma.availabilityBlock.findUnique({
      where: { date: new Date(date) },
    });

    if (!availability) {
      return NextResponse.json(
        {
          success: false,
          message: "Availability block not found for this date",
        },
        { status: 404 }
      );
    }

    const timeBlock = await prisma.timeBlock.create({
      data: {
        availabilityBlockId: availability.id,
        startTime,
        endTime,
        durationMinutes,
      },
    });

    return NextResponse.json({
      success: true,
      timeBlock,
    });
  } catch (error) {
    console.error("Error adding time block:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add time block" },
      { status: 500 }
    );
  }
}

// DELETE a specific time block
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("id");

    if (!blockId) {
      return NextResponse.json(
        { success: false, message: "Block ID is required" },
        { status: 400 }
      );
    }

    // Check if any appointments are booked during this time block
    const timeBlock = await prisma.timeBlock.findUnique({
      where: { id: blockId },
      include: {
        availabilityBlock: true,
      },
    });

    if (!timeBlock) {
      return NextResponse.json(
        { success: false, message: "Time block not found" },
        { status: 404 }
      );
    }

    const bookedAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: timeBlock.availabilityBlock.date,
        startTime: {
          gte: timeBlock.startTime,
          lt: timeBlock.endTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (bookedAppointments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete time block. ${bookedAppointments} appointment(s) already booked during this time.`,
        },
        { status: 400 }
      );
    }

    await prisma.timeBlock.delete({
      where: { id: blockId },
    });

    return NextResponse.json({
      success: true,
      message: "Time block deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting time block:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete time block" },
      { status: 500 }
    );
  }
}
