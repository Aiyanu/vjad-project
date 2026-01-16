/**
 * API Route: Get Calendar Availability
 * GET /api/appointments/availability
 * Returns availability data in WordPress booking plugin format
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  startOfDay,
  isBefore,
} from "date-fns";
import {
  generateDaySlots,
  markBookedSlots,
  createSimplifiedAvailability,
  timeToSeconds,
  determineDayStatus,
  formatSlotsForWordPressAPI,
} from "@/lib/bookingHelpers";
import type {
  BookingCalendarData,
  DatesCollection,
  DateData,
  ResourceData,
  PendingApprovedMap,
  SimplifiedDateAvailability,
} from "@/types/booking";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get("month"); // YYYY-MM format
    const format_type = searchParams.get("format"); // "wordpress" | "simplified"
    const resourceId = parseInt(searchParams.get("resource_id") || "1");

    // Parse target month
    let targetDate: Date;
    if (monthStr) {
      targetDate = new Date(`${monthStr}-01`);
    } else {
      targetDate = new Date();
    }

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

    // Fetch settings
    const settings = await prisma.appointmentSettings.findFirst();
    const defaultDuration = settings?.durationMinutes || 60;

    // Fetch weekly schedule
    const weeklySchedules = await prisma.weeklySchedule.findMany({
      include: {
        timeBlocks: true,
      },
    });

    // Fetch daily overrides
    const dailyAvailability = await prisma.dailyAvailability.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        timeBlocks: true,
      },
    });

    // Fetch all bookings for the month
    const bookings = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    const today = new Date();

    // Build availability map
    const availabilityMap: { [date: string]: SimplifiedDateAvailability } = {};
    const wordpressData: DatesCollection = {};

    for (const day of daysInMonth) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay();
      const isToday = isBefore(day, startOfDay(today));

      // Check for daily override
      const dailyOverride = dailyAvailability.find(
        (d) => format(d.date, "yyyy-MM-dd") === dateStr,
      );

      let timeBlocks: {
        startTime: string;
        endTime: string;
        slotDuration: number;
      }[] = [];
      let enabled = true;
      let isHoliday = false;

      if (dailyOverride) {
        enabled = dailyOverride.enabled;
        isHoliday = dailyOverride.isHoliday;
        if (enabled && !isHoliday) {
          timeBlocks = dailyOverride.timeBlocks.map((block) => ({
            startTime: block.startTime,
            endTime: block.endTime,
            slotDuration: block.slotDuration,
          }));
        }
      } else {
        // Use weekly schedule
        const weeklySchedule = weeklySchedules.find(
          (s) => s.dayOfWeek === dayOfWeek,
        );
        if (weeklySchedule && weeklySchedule.enabled) {
          timeBlocks = weeklySchedule.timeBlocks.map((block) => ({
            startTime: block.startTime,
            endTime: block.endTime,
            slotDuration: block.slotDuration,
          }));
        } else {
          enabled = false;
        }
      }

      // Generate time slots
      const slots = enabled && !isHoliday ? generateDaySlots(timeBlocks) : [];

      // Get bookings for this date
      const dayBookings = bookings
        .filter((b) => format(b.appointmentDate, "yyyy-MM-dd") === dateStr)
        .map((b) => ({
          startSeconds: b.startSeconds,
          endSeconds: b.endSeconds,
          status: b.status,
          bookingId: b.id,
        }));

      // Mark booked slots
      const markedSlots = markBookedSlots(slots, dayBookings);

      // Create simplified availability
      const simplified = createSimplifiedAvailability(
        day,
        markedSlots,
        enabled,
        isHoliday,
      );

      availabilityMap[dateStr] = simplified;

      // Build WordPress format if requested
      if (format_type === "wordpress") {
        const dayStatus = determineDayStatus(
          day,
          enabled,
          isHoliday,
          markedSlots,
          today,
        );
        const bookedTimes = formatSlotsForWordPressAPI(markedSlots);
        const hasBookings = markedSlots.some((s) => !s.available);

        const resourceData: ResourceData = {
          is_day_unavailable: !simplified.isAvailable,
          _day_status: dayStatus,
          pending_approved: Object.fromEntries(
            markedSlots
              .filter((s) => !s.available)
              .map((s) => [Number(s.startSeconds), s.status]),
          ) as PendingApprovedMap,
          tooltips: {
            resource_title: "Default",
            times: hasBookings
              ? `<div class="wpbc_tooltip_resource_container">${markedSlots
                  .filter((s) => !s.available)
                  .map(
                    (s) =>
                      `<div class="wpbc_tooltip_item">${s.startTime.slice(
                        0,
                        5,
                      )} - ${s.endTime.slice(0, 5)}</div>`,
                  )
                  .join("")}</div>`
              : "",
            details: [],
          },
          booked_time_slots: bookedTimes,
          date_cost_rate: 0,
          __booked__times__details: hasBookings ? {} : [],
        };

        const dateData: DateData = {
          day_availability: simplified.isAvailable ? 1 : 0,
          max_capacity: markedSlots.length,
          statuses: {
            day_status: [dayStatus],
            bookings_status: hasBookings ? ["pending"] : [""],
          },
          summary: {
            status_for_day: dayStatus,
            status_for_bookings: hasBookings ? "pending" : "",
            tooltip_times: hasBookings
              ? `<div class="wpbc_tooltip_section tooltip__times"><div class="wpbc_tooltip_title">Booked Times:</div> ${resourceData.tooltips.times}</div>`
              : "",
            tooltip_availability: "",
            tooltip_day_cost: "",
            tooltip_booking_details: "",
            hint__in_day__cost: "",
            hint__in_day__availability: "",
          },
          "1": resourceData,
        };

        wordpressData[dateStr] = dateData;
      }
    }

    // Return WordPress format
    if (format_type === "wordpress") {
      const response: BookingCalendarData = {
        ajx_data: {
          dates: wordpressData,
          resources_id_arr__in_dates: [resourceId],
          aggregate_resource_id_arr: [],
        },
        ajx_search_params: {
          resource_id: resourceId.toString(),
          booking_hash: "",
          request_uri: "/appointments/",
          custom_form: "standard",
          aggregate_resource_id_str: "",
          aggregate_type: "all",
        },
        ajx_cleaned_params: {
          resource_id: resourceId,
          booking_hash: "",
          request_uri: "/appointments/",
          custom_form: "standard",
          aggregate_resource_id_str: "",
          aggregate_type: "all",
        },
        resource_id: resourceId,
      };

      return NextResponse.json(response);
    }

    // Return simplified format
    return NextResponse.json({
      success: true,
      availability: availabilityMap,
      month: format(targetDate, "yyyy-MM"),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch availability",
      },
      { status: 500 },
    );
  }
}
