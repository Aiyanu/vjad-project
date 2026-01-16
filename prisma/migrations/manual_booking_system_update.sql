-- CreateTable for enhanced booking system
CREATE TABLE IF NOT EXISTS "WeeklySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScheduleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklyScheduleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("weeklyScheduleId") REFERENCES "WeeklySchedule"("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL UNIQUE,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Update TimeBlock to reference DailyAvailability instead of AvailabilityBlock
-- This requires dropping the old table and creating a new one

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WeeklySchedule_dayOfWeek_key" ON "WeeklySchedule"("dayOfWeek");
CREATE INDEX IF NOT EXISTS "WeeklySchedule_dayOfWeek_idx" ON "WeeklySchedule"("dayOfWeek");
CREATE INDEX IF NOT EXISTS "ScheduleBlock_weeklyScheduleId_idx" ON "ScheduleBlock"("weeklyScheduleId");
CREATE INDEX IF NOT EXISTS "DailyAvailability_date_idx" ON "DailyAvailability"("date");

-- Add new fields to Appointment table if they don't exist
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "startSeconds" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endSeconds" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "resourceId" INTEGER DEFAULT 1;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

-- Update existing appointments with seconds values
UPDATE "Appointment" 
SET "startSeconds" = 
    CAST(SPLIT_PART("startTime", ':', 1) AS INTEGER) * 3600 + 
    CAST(SPLIT_PART("startTime", ':', 2) AS INTEGER) * 60 + 
    CAST(SPLIT_PART("startTime", ':', 3) AS INTEGER)
WHERE "startSeconds" IS NULL;

UPDATE "Appointment" 
SET "endSeconds" = 
    CAST(SPLIT_PART("endTime", ':', 1) AS INTEGER) * 3600 + 
    CAST(SPLIT_PART("endTime", ':', 2) AS INTEGER) * 60 + 
    CAST(SPLIT_PART("endTime", ':', 3) AS INTEGER)
WHERE "endSeconds" IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Appointment_appointmentDate_startSeconds_endSeconds_idx" ON "Appointment"("appointmentDate", "startSeconds", "endSeconds");

-- Update AppointmentSettings
ALTER TABLE "AppointmentSettings" ADD COLUMN IF NOT EXISTS "maxAdvanceBookingDays" INTEGER DEFAULT 90;
ALTER TABLE "AppointmentSettings" ADD COLUMN IF NOT EXISTS "minAdvanceBookingHours" INTEGER DEFAULT 24;
