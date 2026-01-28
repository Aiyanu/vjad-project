/**
 * Enhanced Appointment Calendar Component
 * Displays monthly view with availability status
 */

"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    isBefore,
    startOfToday,
} from "date-fns";
import { appointmentService } from "@/services/appointmentService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SimplifiedDateAvailability, DayStatus } from "@/types/booking";

interface BookingCalendarProps {
    onSelectDate?: (date: string, availability: SimplifiedDateAvailability) => void;
    selectedDate?: string;
    showLegend?: boolean;
    compact?: boolean;
}

export function BookingCalendar({
    onSelectDate,
    selectedDate,
    showLegend = true,
    compact = false,
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availability, setAvailability] = useState<{
        [date: string]: SimplifiedDateAvailability;
    }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCalendarData();
    }, [currentMonth]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const monthStr = format(currentMonth, "yyyy-MM");
            // You may need to implement this method in appointmentService if it doesn't exist
            const data = await appointmentService.fetchAvailability(monthStr);

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

    const getStatusStyles = (status: DayStatus) => {
        switch (status) {
            case "available":
                return "bg-green-50 hover:bg-green-100 border-green-300 text-green-900";
            case "time_slots_booking":
                return "bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900";
            case "unavailable":
            case "weekday_unavailable":
            case "from_today_unavailable":
                return "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
            default:
                return "bg-white border-gray-300";
        }
    };

    const getDayAvailability = (
        day: Date | null
    ): SimplifiedDateAvailability | null => {
        if (!day) return null;
        const dateStr = format(day, "yyyy-MM-dd");
        return availability[dateStr] || null;
    };

    const handleDateClick = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayAvailability = availability[dateStr];

        if (dayAvailability && dayAvailability.isAvailable) {
            onSelectDate?.(dateStr, dayAvailability);
        }
    };

    const canSelectDate = (day: Date): boolean => {
        if (isBefore(day, startOfToday())) return false;
        const dateStr = format(day, "yyyy-MM-dd");
        const dayAvailability = availability[dateStr];
        return dayAvailability?.isAvailable || false;
    };

    return (
        <div className={cn("w-full", compact ? "max-w-sm" : "max-w-3xl")}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="h-9 w-9 p-0"
                    disabled={loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="h-9 w-9 p-0"
                    disabled={loading}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className="text-center text-sm font-medium text-gray-600 py-2"
                        >
                            {compact ? day.slice(0, 1) : day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {allDays.map((day, index) => {
                        if (!day) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayAvailability = getDayAvailability(day);
                        const isSelected = selectedDate === dateStr;
                        const isTodayDate = isToday(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const selectable = canSelectDate(day);

                        return (
                            <button
                                key={dateStr}
                                onClick={() => selectable && handleDateClick(day)}
                                disabled={!selectable}
                                className={cn(
                                    "aspect-square rounded-lg border-2 transition-all duration-200",
                                    "flex flex-col items-center justify-center",
                                    "text-sm font-medium",
                                    !isCurrentMonth && "opacity-40",
                                    dayAvailability && getStatusStyles(dayAvailability.status),
                                    isSelected && "ring-2 ring-primary ring-offset-2",
                                    isTodayDate && "font-bold",
                                    selectable && "cursor-pointer",
                                    !selectable && "cursor-not-allowed"
                                )}
                            >
                                <span className="text-base">{format(day, "d")}</span>
                                {dayAvailability && dayAvailability.availableSlots.length > 0 && (
                                    <span className="text-[10px] text-gray-500">
                                        {dayAvailability.availableSlots.length} slots
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-300"></div>
                        <span>Partially Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200"></div>
                        <span>Unavailable</span>
                    </div>
                </div>
            )}
        </div>
    );
}
