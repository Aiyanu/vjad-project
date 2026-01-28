/**
 * Time Slot Selector Component
 * Displays and allows selection of available time slots
 */

"use client";

import React, { useState, useEffect } from "react";
import { appointmentService } from "@/services/appointmentService";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { timeToReadable, timeRangeToReadable } from "@/lib/bookingHelpers";
import type { TimeSlotInfo } from "@/types/booking";

interface TimeSlotSelectorProps {
    date: string; // YYYY-MM-DD format
    onSelectSlot?: (slot: TimeSlotInfo) => void;
    selectedSlot?: TimeSlotInfo | null;
    showStatus?: boolean;
}

export function TimeSlotSelector({
    date,
    onSelectSlot,
    selectedSlot,
    showStatus = true,
}: TimeSlotSelectorProps) {
    const [slots, setSlots] = useState<TimeSlotInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (date) {
            fetchTimeSlots();
        }
    }, [date]);

    const fetchTimeSlots = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await appointmentService.fetchSlotsByDate(date);
            if (data.success) {
                setSlots(data.slots || []);
                if (data.slots.length === 0) {
                    setError("No time slots available for this date");
                }
            } else {
                setError(data.error || "Failed to load time slots");
            }
        } catch (err) {
            console.error("Error fetching time slots:", err);
            setError("Failed to load time slots");
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot: TimeSlotInfo) => {
        if (slot.available) {
            onSelectSlot?.(slot);
        }
    };

    const isSlotSelected = (slot: TimeSlotInfo): boolean => {
        if (!selectedSlot) return false;
        return (
            slot.startSeconds === selectedSlot.startSeconds &&
            slot.endSeconds === selectedSlot.endSeconds
        );
    };

    const getSlotStyles = (slot: TimeSlotInfo, selected: boolean) => {
        if (!slot.available) {
            return "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
        }
        if (selected) {
            return "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2";
        }
        return "bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 text-gray-900";
    };

    const groupSlotsByPeriod = () => {
        const morning = slots.filter((s) => s.startSeconds < 12 * 3600);
        const afternoon = slots.filter(
            (s) => s.startSeconds >= 12 * 3600 && s.startSeconds < 17 * 3600
        );
        const evening = slots.filter((s) => s.startSeconds >= 17 * 3600);

        return { morning, afternoon, evening };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No time slots available</p>
            </div>
        );
    }

    const { morning, afternoon, evening } = groupSlotsByPeriod();
    const availableCount = slots.filter((s) => s.available).length;

    return (
        <div className="space-y-6">
            {/* Summary */}
            {showStatus && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                            {availableCount} slot{availableCount !== 1 ? "s" : ""} available
                        </span>
                    </div>
                    {selectedSlot && (
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Slot selected</span>
                        </div>
                    )}
                </div>
            )}

            {/* Morning Slots */}
            {morning.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Morning (Before 12 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {morning.map((slot) => {
                            const selected = isSlotSelected(slot);
                            return (
                                <Button
                                    key={`${slot.startSeconds}-${slot.endSeconds}`}
                                    variant="outline"
                                    onClick={() => handleSlotClick(slot)}
                                    disabled={!slot.available}
                                    className={cn(
                                        "h-auto py-3 px-4 flex flex-col items-center gap-1 transition-all",
                                        getSlotStyles(slot, selected)
                                    )}
                                >
                                    <span className="font-semibold">
                                        {timeToReadable(slot.startTime)}
                                    </span>
                                    <span className="text-xs opacity-75">
                                        {timeToReadable(slot.endTime)}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Afternoon Slots */}
            {afternoon.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Afternoon (12 PM - 5 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {afternoon.map((slot) => {
                            const selected = isSlotSelected(slot);
                            return (
                                <Button
                                    key={`${slot.startSeconds}-${slot.endSeconds}`}
                                    variant="outline"
                                    onClick={() => handleSlotClick(slot)}
                                    disabled={!slot.available}
                                    className={cn(
                                        "h-auto py-3 px-4 flex flex-col items-center gap-1 transition-all",
                                        getSlotStyles(slot, selected)
                                    )}
                                >
                                    <span className="font-semibold">
                                        {timeToReadable(slot.startTime)}
                                    </span>
                                    <span className="text-xs opacity-75">
                                        {timeToReadable(slot.endTime)}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Evening Slots */}
            {evening.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Evening (After 5 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {evening.map((slot) => {
                            const selected = isSlotSelected(slot);
                            return (
                                <Button
                                    key={`${slot.startSeconds}-${slot.endSeconds}`}
                                    variant="outline"
                                    onClick={() => handleSlotClick(slot)}
                                    disabled={!slot.available}
                                    className={cn(
                                        "h-auto py-3 px-4 flex flex-col items-center gap-1 transition-all",
                                        getSlotStyles(slot, selected)
                                    )}
                                >
                                    <span className="font-semibold">
                                        {timeToReadable(slot.startTime)}
                                    </span>
                                    <span className="text-xs opacity-75">
                                        {timeToReadable(slot.endTime)}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
