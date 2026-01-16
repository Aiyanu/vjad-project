/**
 * API Route: Manage Weekly Schedule
 * GET, POST, PUT, DELETE for weekly availability templates
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateToken } from "@/lib/authMiddleware";

// GET - Fetch weekly schedule
export async function GET(request: NextRequest) {
  try {
    const schedules = await prisma.weeklySchedule.findMany({
      include: {
        timeBlocks: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch schedule",
      },
      { status: 500 },
    );
  }
}

// POST - Create or update weekly schedule for a day
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
    const { dayOfWeek, enabled, timeBlocks } = body;

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid day of week (must be 0-6)",
        },
        { status: 400 },
      );
    }

    // Delete existing schedule for this day
    await prisma.weeklySchedule.deleteMany({
      where: { dayOfWeek },
    });

    // Create new schedule
    const schedule = await prisma.weeklySchedule.create({
      data: {
        dayOfWeek,
        enabled,
        timeBlocks: {
          create:
            timeBlocks?.map((block: any) => ({
              startTime: block.startTime,
              endTime: block.endTime,
              slotDuration: block.slotDuration || 60,
            })) || [],
        },
      },
      include: {
        timeBlocks: true,
      },
    });

    return NextResponse.json({
      success: true,
      schedule,
      message: "Weekly schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating weekly schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update schedule",
      },
      { status: 500 },
    );
  }
}
