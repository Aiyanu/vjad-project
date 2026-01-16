/**
 * API Route: Create Appointment Booking
 * POST /api/appointments/create
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parse, format } from "date-fns";
import {
  timeToSeconds,
  validateBookingSlot,
  generateDaySlots,
  markBookedSlots,
} from "@/lib/bookingHelpers";
import { z } from "zod";

const bookingSchema = z.object({
  visitorName: z.string().min(2, "Name must be at least 2 characters"),
  visitorEmail: z.string().email("Invalid email address"),
  visitorPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      appointmentDate,
      startTime,
      endTime,
      message,
    } = validation.data;

    const date = parse(appointmentDate, "yyyy-MM-dd", new Date());
    const dayOfWeek = date.getDay();

    // Get settings
    const settings = await prisma.appointmentSettings.findFirst();
    const minAdvanceHours = settings?.minAdvanceBookingHours || 24;

    // Fetch schedule
    const dailyAvailability = await prisma.dailyAvailability.findUnique({
      where: { date },
      include: { timeBlocks: true },
    });

    let timeBlocks: {
      startTime: string;
      endTime: string;
      slotDuration: number;
    }[] = [];

    if (
      dailyAvailability &&
      dailyAvailability.enabled &&
      !dailyAvailability.isHoliday
    ) {
      timeBlocks = dailyAvailability.timeBlocks.map((block) => ({
        startTime: block.startTime,
        endTime: block.endTime,
        slotDuration: block.slotDuration,
      }));
    } else {
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
      }
    }

    if (timeBlocks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No availability for the selected date",
        },
        { status: 400 },
      );
    }

    // Generate available slots
    let slots = generateDaySlots(timeBlocks);

    // Get existing bookings
    const existingBookings = await prisma.appointment.findMany({
      where: {
        appointmentDate: date,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    const bookedSlots = existingBookings.map((b) => ({
      startSeconds: b.startSeconds,
      endSeconds: b.endSeconds,
      status: b.status,
      bookingId: b.id,
    }));

    // Mark booked slots
    slots = markBookedSlots(slots, bookedSlots);

    // Validate the requested slot
    const validationResult = validateBookingSlot(
      date,
      startTime,
      endTime,
      slots,
      minAdvanceHours,
    );

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 400 },
      );
    }

    // Check for double booking
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);

    const conflictingBooking = await prisma.appointment.findFirst({
      where: {
        appointmentDate: date,
        status: {
          in: ["pending", "confirmed"],
        },
        OR: [
          {
            AND: [
              { startSeconds: { lte: startSeconds } },
              { endSeconds: { gt: startSeconds } },
            ],
          },
          {
            AND: [
              { startSeconds: { lt: endSeconds } },
              { endSeconds: { gte: endSeconds } },
            ],
          },
          {
            AND: [
              { startSeconds: { gte: startSeconds } },
              { endSeconds: { lte: endSeconds } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This time slot has just been booked. Please select another slot.",
        },
        { status: 409 },
      );
    }

    // Create the booking
    const appointment = await prisma.appointment.create({
      data: {
        visitorName,
        visitorEmail,
        visitorPhone,
        appointmentDate: date,
        startTime,
        endTime,
        startSeconds,
        endSeconds,
        message: message || null,
        status: "pending",
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      booking: {
        id: appointment.id,
        appointmentDate: format(appointment.appointmentDate, "yyyy-MM-dd"),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
      },
      message:
        "Appointment booked successfully! You will receive a confirmation email shortly.",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking",
      },
      { status: 500 },
    );
  }
}
