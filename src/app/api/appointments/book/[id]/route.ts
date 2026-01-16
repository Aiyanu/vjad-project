import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Update appointment status
 * PATCH /api/appointments/book/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appointment = await prisma.appointmentBooking.update({
      where: { id },
      data: { status: status as any },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment status updated",
      appointment,
    });
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete appointment
 * DELETE /api/appointments/book/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointmentBooking.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    await prisma.appointmentBooking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete appointment",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
