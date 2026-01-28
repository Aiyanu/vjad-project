import React, { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface AvailabilityData {
  [key: string]: {
    date: string;
    dayOfWeek: number;
    status: "available" | "booked" | "unavailable";
    bookedCount: number;
  };
}

interface AppointmentCalendarProps {
  onSelectDate?: (date: string, dayOfWeek: number) => void;
  selectedDate?: string;
  showLegend?: boolean;
  compact?: boolean;
}

export function AppointmentCalendar({
  onSelectDate,
  selectedDate,
  showLegend = true,
  compact = false,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const monthStr = format(currentMonth, "yyyy-MM");
      // You may need to implement this method in appointmentService if it doesn't exist
      const data = await appointmentService.fetchCalendar(monthStr);
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Pad the start of the month with empty days
  const startingDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startingDayOfWeek).fill(null);

  const allDays = [...emptyDays, ...daysInMonth];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 hover:bg-green-200 text-green-900 border-green-300";
      case "booked":
        return "bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300";
      case "unavailable":
        return "bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300";
      default:
        return "bg-white border-gray-300";
    }
  };

  const getDayStatus = (day: Date | null) => {
    if (!day) return null;
    const dateStr = format(day, "yyyy-MM-dd");
    return availability[dateStr];
  };

  return (
    <div className={clsx("w-full", compact ? "max-w-sm" : "")}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold min-w-40 text-center">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of Week Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={clsx("grid gap-2", compact ? "grid-cols-7" : "grid-cols-7")}>
        {allDays.map((day, index) => {
          const dayStatus = getDayStatus(day);
          const isSelected = day && format(day, "yyyy-MM-dd") === selectedDate;

          return (
            <div key={index} className="aspect-square">
              {!day ? (
                <div className="h-full bg-gray-50 rounded-lg"></div>
              ) : (
                <button
                  onClick={() => {
                    if (dayStatus?.status !== "unavailable" && onSelectDate) {
                      onSelectDate(format(day, "yyyy-MM-dd"), day.getDay());
                    }
                  }}
                  disabled={dayStatus?.status === "unavailable"}
                  title={`${format(day, "MMM d, yyyy")} - ${dayStatus?.status === "available"
                      ? "Available"
                      : dayStatus?.status === "booked"
                        ? "Fully Booked"
                        : "Unavailable"
                    }`}
                  className={clsx(
                    "w-full h-full rounded-lg border-2 font-semibold text-sm transition-all",
                    "flex items-center justify-center",
                    dayStatus && getStatusColor(dayStatus.status),
                    !dayStatus && "border-gray-300 bg-white",
                    isSelected &&
                    dayStatus?.status !== "unavailable" &&
                    "ring-2 ring-offset-2 ring-primary",
                    dayStatus?.status === "unavailable" && "cursor-not-allowed"
                  )}
                >
                  {format(day, "d")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-sm mb-3">Availability Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-300"></div>
              <span className="text-sm text-gray-700">Available - Click to book</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-orange-100 border-2 border-orange-300"></div>
              <span className="text-sm text-gray-700">Fully Booked - No slots available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300"></div>
              <span className="text-sm text-gray-500">Unavailable - No appointments</span>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Loading calendar...
        </div>
      )}
    </div>
  );
}
