/**
 * Booking Helper Functions
 * Time calculations, slot generation, and availability checking
 */

import {
  format,
  parse,
  startOfDay,
  addMinutes,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import type {
  TimeSlotInfo,
  SimplifiedDateAvailability,
  DayStatus,
  BookingStatus,
} from "@/types/booking";

// ─── Time Conversion Utilities ───

/**
 * Convert HH:mm:ss to seconds from start of day
 */
export function timeToSeconds(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60 + (seconds || 0);
}

/**
 * Convert seconds to HH:mm:ss format
 */
export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

/**
 * Convert HH:mm:ss to readable 12-hour format
 */
export function timeToReadable(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Convert time range to readable format
 */
export function timeRangeToReadable(
  startTime: string,
  endTime: string
): string {
  return `${timeToReadable(startTime)} - ${timeToReadable(endTime)}`;
}

// ─── Slot Generation ───

/**
 * Generate time slots for a given time block
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): TimeSlotInfo[] {
  const slots: TimeSlotInfo[] = [];
  const startSeconds = timeToSeconds(startTime);
  const endSeconds = timeToSeconds(endTime);
  const durationSeconds = slotDuration * 60;

  let currentSeconds = startSeconds;

  while (currentSeconds + durationSeconds <= endSeconds) {
    const slotStart = secondsToTime(currentSeconds);
    const slotEnd = secondsToTime(currentSeconds + durationSeconds);

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      startSeconds: currentSeconds,
      endSeconds: currentSeconds + durationSeconds,
      available: true,
      status: "available",
    });

    currentSeconds += durationSeconds;
  }

  return slots;
}

/**
 * Generate all time slots for a day based on multiple time blocks
 */
export function generateDaySlots(
  timeBlocks: { startTime: string; endTime: string; slotDuration: number }[]
): TimeSlotInfo[] {
  const allSlots: TimeSlotInfo[] = [];

  timeBlocks.forEach((block) => {
    const blockSlots = generateTimeSlots(
      block.startTime,
      block.endTime,
      block.slotDuration
    );
    allSlots.push(...blockSlots);
  });

  // Sort by start time
  return allSlots.sort((a, b) => a.startSeconds - b.startSeconds);
}

// ─── Availability Checking ───

/**
 * Check if two time slots overlap
 */
export function slotsOverlap(
  slot1Start: number,
  slot1End: number,
  slot2Start: number,
  slot2End: number
): boolean {
  return slot1Start < slot2End && slot2Start < slot1End;
}

/**
 * Mark booked slots as unavailable
 */
export function markBookedSlots(
  availableSlots: TimeSlotInfo[],
  bookedSlots: {
    startSeconds: number;
    endSeconds: number;
    status: BookingStatus;
    bookingId?: string;
  }[]
): TimeSlotInfo[] {
  return availableSlots.map((slot) => {
    const booked = bookedSlots.find((b) =>
      slotsOverlap(
        slot.startSeconds,
        slot.endSeconds,
        b.startSeconds,
        b.endSeconds
      )
    );

    if (booked) {
      return {
        ...slot,
        available: false,
        status: booked.status,
        bookingId: booked.bookingId,
      };
    }

    return slot;
  });
}

// ─── Date Status Determination ───

/**
 * Determine the overall status of a date
 */
export function determineDayStatus(
  date: Date,
  hasSchedule: boolean,
  isHoliday: boolean,
  availableSlots: TimeSlotInfo[],
  today: Date
): DayStatus {
  // Check if date is in the past
  if (isBefore(date, startOfDay(today))) {
    return "from_today_unavailable";
  }

  // Check if it's a holiday
  if (isHoliday) {
    return "weekday_unavailable";
  }

  // Check if there's no schedule for this day
  if (!hasSchedule || availableSlots.length === 0) {
    return "weekday_unavailable";
  }

  // Check if there are any bookings
  const hasBookings = availableSlots.some((slot) => !slot.available);
  const allBooked = availableSlots.every((slot) => !slot.available);

  if (allBooked) {
    return "unavailable";
  }

  if (hasBookings) {
    return "time_slots_booking";
  }

  return "available";
}

// ─── Capacity Calculations ───

/**
 * Calculate day availability (0 = unavailable, 1+ = available)
 */
export function calculateDayAvailability(slots: TimeSlotInfo[]): number {
  const availableCount = slots.filter((s) => s.available).length;
  return availableCount > 0 ? 1 : 0;
}

/**
 * Get booking count for a date
 */
export function getBookingCount(slots: TimeSlotInfo[]): number {
  return slots.filter((s) => !s.available).length;
}

// ─── Validation ───

/**
 * Validate booking time slot
 */
export function validateBookingSlot(
  date: Date,
  startTime: string,
  endTime: string,
  availableSlots: TimeSlotInfo[],
  minAdvanceHours: number = 24
): { valid: boolean; error?: string } {
  const now = new Date();
  const bookingDateTime = parse(startTime, "HH:mm:ss", date);

  // Check if booking is too soon
  const hoursUntilBooking =
    (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking < minAdvanceHours) {
    return {
      valid: false,
      error: `Bookings must be made at least ${minAdvanceHours} hours in advance.`,
    };
  }

  // Check if slot exists and is available
  const requestedStartSeconds = timeToSeconds(startTime);
  const requestedEndSeconds = timeToSeconds(endTime);

  const matchingSlot = availableSlots.find(
    (slot) =>
      slot.startSeconds === requestedStartSeconds &&
      slot.endSeconds === requestedEndSeconds
  );

  if (!matchingSlot) {
    return {
      valid: false,
      error: "The requested time slot is not available.",
    };
  }

  if (!matchingSlot.available) {
    return {
      valid: false,
      error: "The requested time slot is already booked.",
    };
  }

  return { valid: true };
}

// ─── Formatting for API Response ───

/**
 * Convert slots to WordPress-style format
 */
export function formatSlotsForWordPressAPI(slots: TimeSlotInfo[]): {
  in_seconds: [number, number][];
  readable24h: string[];
  merged_seconds: [number, number][];
  merged_readable: string[];
} {
  const bookedSlots = slots.filter((s) => !s.available);

  return {
    in_seconds: bookedSlots.map((s) => [s.startSeconds, s.endSeconds]),
    readable24h: bookedSlots.map(
      (s) => `${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)}`
    ),
    merged_seconds: bookedSlots.map((s) => [s.startSeconds, s.endSeconds]),
    merged_readable: bookedSlots.map((s) =>
      timeRangeToReadable(s.startTime, s.endTime)
    ),
  };
}

/**
 * Create simplified date availability object
 */
export function createSimplifiedAvailability(
  date: Date,
  slots: TimeSlotInfo[],
  hasSchedule: boolean,
  isHoliday: boolean = false
): SimplifiedDateAvailability {
  const today = new Date();
  const dayStatus = determineDayStatus(
    date,
    hasSchedule,
    isHoliday,
    slots,
    today
  );

  return {
    date: format(date, "yyyy-MM-dd"),
    dayOfWeek: date.getDay(),
    isAvailable:
      dayStatus === "available" || dayStatus === "time_slots_booking",
    status: dayStatus,
    availableSlots: slots.filter((s) => s.available),
    bookedSlots: slots.filter((s) => !s.available),
    maxCapacity: slots.length,
  };
}

// ─── Time Zone Handling ───

/**
 * Get current time in seconds (for checking real-time availability)
 */
export function getCurrentTimeSeconds(): number {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

/**
 * Filter out past time slots for today
 */
export function filterPastSlots(
  slots: TimeSlotInfo[],
  date: Date
): TimeSlotInfo[] {
  const today = new Date();

  if (!isSameDay(date, today)) {
    return slots;
  }

  const currentSeconds = getCurrentTimeSeconds();

  return slots.filter((slot) => slot.startSeconds > currentSeconds);
}
