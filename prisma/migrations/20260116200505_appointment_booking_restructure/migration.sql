/*
  Warnings:

  - You are about to drop the column `availabilityBlockId` on the `TimeBlock` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `TimeBlock` table. All the data in the column will be lost.
  - You are about to drop the `AvailabilityBlock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endSeconds` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startSeconds` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyAvailabilityId` to the `TimeBlock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeBlock" DROP CONSTRAINT "TimeBlock_availabilityBlockId_fkey";

-- DropIndex
DROP INDEX "TimeBlock_availabilityBlockId_idx";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "endSeconds" INTEGER NOT NULL,
ADD COLUMN     "resourceId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startSeconds" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AppointmentSettings" ADD COLUMN     "maxAdvanceBookingDays" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "minAdvanceBookingHours" INTEGER NOT NULL DEFAULT 24;

-- AlterTable
ALTER TABLE "TimeBlock" DROP COLUMN "availabilityBlockId",
DROP COLUMN "durationMinutes",
ADD COLUMN     "dailyAvailabilityId" TEXT NOT NULL,
ADD COLUMN     "maxCapacity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "slotDuration" INTEGER NOT NULL DEFAULT 60;

-- DropTable
DROP TABLE "AvailabilityBlock";

-- CreateTable
CREATE TABLE "WeeklySchedule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "weeklyScheduleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAvailability" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklySchedule_dayOfWeek_idx" ON "WeeklySchedule"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySchedule_dayOfWeek_key" ON "WeeklySchedule"("dayOfWeek");

-- CreateIndex
CREATE INDEX "ScheduleBlock_weeklyScheduleId_idx" ON "ScheduleBlock"("weeklyScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAvailability_date_key" ON "DailyAvailability"("date");

-- CreateIndex
CREATE INDEX "DailyAvailability_date_idx" ON "DailyAvailability"("date");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_startSeconds_endSeconds_idx" ON "Appointment"("appointmentDate", "startSeconds", "endSeconds");

-- CreateIndex
CREATE INDEX "TimeBlock_dailyAvailabilityId_idx" ON "TimeBlock"("dailyAvailabilityId");

-- AddForeignKey
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_weeklyScheduleId_fkey" FOREIGN KEY ("weeklyScheduleId") REFERENCES "WeeklySchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_dailyAvailabilityId_fkey" FOREIGN KEY ("dailyAvailabilityId") REFERENCES "DailyAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
