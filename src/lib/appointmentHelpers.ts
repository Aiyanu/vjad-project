import { prisma } from "@/lib/db";

/**
 * Example: Seed appointment slots for testing
 * Add this to your seed database or run manually
 */
export async function seedAppointmentSlots() {
  try {
    // Define working hours: 9 AM - 5 PM, 1-hour slots, Monday-Friday
    const slots = [
      // Monday (1)
      { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
      { dayOfWeek: 1, startTime: "11:00", endTime: "12:00" },
      { dayOfWeek: 1, startTime: "14:00", endTime: "15:00" },
      { dayOfWeek: 1, startTime: "15:00", endTime: "16:00" },
      { dayOfWeek: 1, startTime: "16:00", endTime: "17:00" },

      // Tuesday (2)
      { dayOfWeek: 2, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 2, startTime: "10:00", endTime: "11:00" },
      { dayOfWeek: 2, startTime: "11:00", endTime: "12:00" },
      { dayOfWeek: 2, startTime: "14:00", endTime: "15:00" },
      { dayOfWeek: 2, startTime: "15:00", endTime: "16:00" },
      { dayOfWeek: 2, startTime: "16:00", endTime: "17:00" },

      // Wednesday (3)
      { dayOfWeek: 3, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 3, startTime: "10:00", endTime: "11:00" },
      { dayOfWeek: 3, startTime: "11:00", endTime: "12:00" },
      { dayOfWeek: 3, startTime: "14:00", endTime: "15:00" },
      { dayOfWeek: 3, startTime: "15:00", endTime: "16:00" },
      { dayOfWeek: 3, startTime: "16:00", endTime: "17:00" },

      // Thursday (4)
      { dayOfWeek: 4, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "11:00" },
      { dayOfWeek: 4, startTime: "11:00", endTime: "12:00" },
      { dayOfWeek: 4, startTime: "14:00", endTime: "15:00" },
      { dayOfWeek: 4, startTime: "15:00", endTime: "16:00" },
      { dayOfWeek: 4, startTime: "16:00", endTime: "17:00" },

      // Friday (5)
      { dayOfWeek: 5, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "11:00" },
      { dayOfWeek: 5, startTime: "11:00", endTime: "12:00" },
      { dayOfWeek: 5, startTime: "14:00", endTime: "15:00" },
      { dayOfWeek: 5, startTime: "15:00", endTime: "16:00" },
      { dayOfWeek: 5, startTime: "16:00", endTime: "17:00" },
    ];

    console.log("Creating appointment slots...");

    for (const slot of slots) {
      await prisma.appointmentSlot.upsert({
        where: {
          dayOfWeek_startTime_endTime: {
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        },
        update: {},
        create: {
          ...slot,
          isAvailable: true,
        },
      });
    }

    console.log(`✅ Created ${slots.length} appointment slots`);
  } catch (error) {
    console.error("Error seeding appointment slots:", error);
    throw error;
  }
}

/**
 * Example: Create a test appointment
 */
export async function createTestAppointment() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find next Monday
    let daysUntilMonday = (1 - tomorrow.getDay() + 7) % 7 || 7;
    const appointmentDate = new Date(tomorrow);
    appointmentDate.setDate(appointmentDate.getDate() + daysUntilMonday);

    const booking = await prisma.appointmentBooking.create({
      data: {
        visitorName: "John Doe",
        visitorEmail: "john@example.com",
        visitorPhone: "+2348012345678",
        appointmentDate,
        startTime: "09:00",
        endTime: "10:00",
        message: "Test booking",
        status: "pending",
      },
    });

    console.log("✅ Test appointment created:", booking);
    return booking;
  } catch (error) {
    console.error("Error creating test appointment:", error);
    throw error;
  }
}

/**
 * Example: Get available appointments for next 7 days
 */
export async function getUpcomingAvailability() {
  try {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bookings = await prisma.appointmentBooking.findMany({
      where: {
        appointmentDate: {
          gte: today,
          lte: sevenDaysLater,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    console.log("Upcoming bookings (next 7 days):", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    throw error;
  }
}

/**
 * Example: Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string) {
  try {
    const updated = await prisma.appointmentBooking.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });

    console.log("✅ Appointment cancelled:", updated);
    return updated;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
}

/**
 * Example: Confirm a pending appointment
 */
export async function confirmAppointment(appointmentId: string) {
  try {
    const updated = await prisma.appointmentBooking.update({
      where: { id: appointmentId },
      data: { status: "confirmed" },
    });

    console.log("✅ Appointment confirmed:", updated);
    return updated;
  } catch (error) {
    console.error("Error confirming appointment:", error);
    throw error;
  }
}

/**
 * Example: Get statistics
 */
export async function getAppointmentStats() {
  try {
    const totalSlots = await prisma.appointmentSlot.count();
    const totalBookings = await prisma.appointmentBooking.count();
    const pendingBookings = await prisma.appointmentBooking.count({
      where: { status: "pending" },
    });
    const confirmedBookings = await prisma.appointmentBooking.count({
      where: { status: "confirmed" },
    });

    const stats = {
      totalSlots,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings: await prisma.appointmentBooking.count({
        where: { status: "completed" },
      }),
      cancelledBookings: await prisma.appointmentBooking.count({
        where: { status: "cancelled" },
      }),
    };

    console.log("📊 Appointment Statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}
