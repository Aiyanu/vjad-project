import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Book an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      appointmentDate,
      startTime,
      endTime,
      message,
    } = body;

    // Validate required fields
    if (
      !visitorName ||
      !visitorEmail ||
      !visitorPhone ||
      !appointmentDate ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slot is available
    const selectedDate = new Date(appointmentDate);
    const dayOfWeek = selectedDate.getDay();

    const slot = await prisma.appointmentSlot.findFirst({
      where: {
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Selected time slot is not available" },
        { status: 400 }
      );
    }

    // Check if this specific time is already booked
    const existingBooking = await prisma.appointmentBooking.findFirst({
      where: {
        appointmentDate: new Date(appointmentDate),
        startTime,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointmentBooking.create({
      data: {
        visitorName,
        visitorEmail,
        visitorPhone,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        message,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: "Failed to book appointment", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get all appointments (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const appointments = await prisma.appointmentBooking.findMany({
      orderBy: {
        appointmentDate: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments", details: error.message },
      { status: 500 }
    );
  }
}
