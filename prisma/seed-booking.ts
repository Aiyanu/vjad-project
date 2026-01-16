/**
 * Seed script for appointment booking system
 * Initializes weekly schedule with default availability
 */

import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function seedBookingSystem() {
  console.log("🌱 Seeding booking system...");

  // Create or update settings
  const settings = await prisma.appointmentSettings.upsert({
    where: { id: 1 },
    update: {
      durationMinutes: 60,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 24,
    },
    create: {
      durationMinutes: 60,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 24,
    },
  });

  console.log("✅ Settings created:", settings);

  // Create default weekly schedule
  const defaultSchedule = [
    // Sunday - Closed
    {
      dayOfWeek: 0,
      enabled: false,
      timeBlocks: [],
    },
    // Monday - Closed
    {
      dayOfWeek: 1,
      enabled: false,
      timeBlocks: [],
    },
    // Tuesday - Closed
    {
      dayOfWeek: 2,
      enabled: false,
      timeBlocks: [],
    },
    // Wednesday - Open
    {
      dayOfWeek: 3,
      enabled: true,
      timeBlocks: [
        { startTime: "10:00:00", endTime: "12:00:00", slotDuration: 30 },
        { startTime: "14:00:00", endTime: "17:00:00", slotDuration: 30 },
      ],
    },
    // Thursday - Open
    {
      dayOfWeek: 4,
      enabled: true,
      timeBlocks: [
        { startTime: "10:00:00", endTime: "12:00:00", slotDuration: 30 },
        { startTime: "14:00:00", endTime: "17:00:00", slotDuration: 30 },
      ],
    },
    // Friday - Open
    {
      dayOfWeek: 5,
      enabled: true,
      timeBlocks: [
        { startTime: "10:00:00", endTime: "13:00:00", slotDuration: 30 },
      ],
    },
    // Saturday - Open
    {
      dayOfWeek: 6,
      enabled: true,
      timeBlocks: [
        { startTime: "09:00:00", endTime: "12:00:00", slotDuration: 30 },
      ],
    },
  ];

  for (const schedule of defaultSchedule) {
    // Delete existing schedule for this day
    await prisma.weeklySchedule.deleteMany({
      where: { dayOfWeek: schedule.dayOfWeek },
    });

    // Create new schedule
    const created = await prisma.weeklySchedule.create({
      data: {
        dayOfWeek: schedule.dayOfWeek,
        enabled: schedule.enabled,
        timeBlocks: {
          create: schedule.timeBlocks,
        },
      },
      include: {
        timeBlocks: true,
      },
    });

    console.log(
      `✅ Schedule for day ${schedule.dayOfWeek} created:`,
      created.timeBlocks.length,
      "blocks"
    );
  }

  console.log("✅ Booking system seeding complete!");
}

seedBookingSystem()
  .catch((e) => {
    console.error("❌ Error seeding booking system:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
