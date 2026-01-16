/**
 * API Route: Manage Daily Availability Overrides
 * GET, POST for specific date availability
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateToken } from "@/lib/authMiddleware";
import { parse } from "date-fns";

// GET - Fetch daily availability for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate) {
      where.date = { gte: parse(startDate, "yyyy-MM-dd", new Date()) };
    }
    if (endDate) {
      where.date = {
        ...where.date,
        lte: parse(endDate, "yyyy-MM-dd", new Date()),
      };
    }

    const availability = await prisma.dailyAvailability.findMany({
      where,
      include: {
        timeBlocks: true,
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
    console.error("Error fetching daily availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch availability",
      },
      { status: 500 },
    );
  }
}

// POST - Create or update daily availability
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authenticateToken(request);
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { date, enabled, isHoliday, timeBlocks } = body;

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 },
      );
    }

    const parsedDate = parse(date, "yyyy-MM-dd", new Date());

    // Delete existing availability for this date
    await prisma.dailyAvailability.deleteMany({
      where: { date: parsedDate },
    });

    // Create new availability
    const availability = await prisma.dailyAvailability.create({
      data: {
        date: parsedDate,
        enabled: enabled ?? true,
        isHoliday: isHoliday ?? false,
        timeBlocks: {
          create:
            timeBlocks?.map((block: any) => ({
              startTime: block.startTime,
              endTime: block.endTime,
              slotDuration: block.slotDuration || 60,
              maxCapacity: block.maxCapacity || 1,
            })) || [],
        },
      },
      include: {
        timeBlocks: true,
      },
    });

    return NextResponse.json({
      success: true,
      availability,
      message: "Daily availability updated successfully",
    });
  } catch (error) {
    console.error("Error updating daily availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update availability",
      },
      { status: 500 },
    );
  }
}

// DELETE - Remove daily availability override (will fall back to weekly schedule)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authenticateToken(request);
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 },
      );
    }

    const parsedDate = parse(date, "yyyy-MM-dd", new Date());

    await prisma.dailyAvailability.deleteMany({
      where: { date: parsedDate },
    });

    return NextResponse.json({
      success: true,
      message: "Daily availability override removed",
    });
  } catch (error) {
    console.error("Error deleting daily availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete availability",
      },
      { status: 500 },
    );
  }
}
