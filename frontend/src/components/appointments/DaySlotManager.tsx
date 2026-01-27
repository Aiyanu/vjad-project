"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Clock, Calendar, AlertCircle, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

interface AppointmentSlot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface TimeSlot {
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    tempId: string;
}

const DAYS = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

export function DaySlotManager() {
    const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday
    const [slots, setSlots] = useState<AppointmentSlot[]>([]);
    const [tempSlots, setTempSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchSlots();
    }, []);

    useEffect(() => {
        // When day changes, reset temp slots and selections
        setTempSlots([{ startTime: "09:00", endTime: "17:00", duration: 60, tempId: Date.now().toString() }]);
        setSelectedSlots(new Set());
    }, [selectedDay]);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/appointments/slots");
            const data = await response.json();
            if (data.success) {
                setSlots(data.slots || []);
            }
        } catch (error) {
            toast.error("Failed to load slots");
        } finally {
            setLoading(false);
        }
    };

    const getDaySlots = (dayOfWeek: number) => {
        return slots.filter((s) => s.dayOfWeek === dayOfWeek);
    };

    const calculateTotalHours = (daySlots: TimeSlot[] | AppointmentSlot[]) => {
        let totalMinutes = 0;
        daySlots.forEach((slot) => {
            const [startHour, startMin] = slot.startTime.split(":").map(Number);
            const [endHour, endMin] = slot.endTime.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            totalMinutes += endMinutes - startMinutes;
        });
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes, totalMinutes };
    };

    const validateTimeSlot = (startTime: string, endTime: string): string | null => {
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
            return "Invalid hour (must be 0-23)";
        }

        if (startMin < 0 || startMin > 59 || endMin < 0 || endMin > 59) {
            return "Invalid minutes (must be 0-59)";
        }

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            return "End time must be after start time";
        }

        return null;
    };

    const checkOverlappingSlots = (): string | null => {
        // Generate all actual slots that will be created
        const allGeneratedSlots: { start: number; end: number; rangeIndex: number }[] = [];

        tempSlots.forEach((slot, rangeIndex) => {
            const [startHour, startMin] = slot.startTime.split(":").map(Number);
            const [endHour, endMin] = slot.endTime.split(":").map(Number);

            let currentMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            while (currentMinutes < endMinutes) {
                const remainingMinutes = endMinutes - currentMinutes;
                const actualDuration = Math.min(slot.duration, remainingMinutes);
                const slotEndMinutes = currentMinutes + actualDuration;

                allGeneratedSlots.push({
                    start: currentMinutes,
                    end: slotEndMinutes,
                    rangeIndex: rangeIndex
                });

                currentMinutes += actualDuration;
            }
        });

        // Check for overlaps between generated slots
        for (let i = 0; i < allGeneratedSlots.length; i++) {
            for (let j = i + 1; j < allGeneratedSlots.length; j++) {
                const slot1 = allGeneratedSlots[i];
                const slot2 = allGeneratedSlots[j];

                // Check if slots overlap
                if ((slot1.start < slot2.end && slot1.end > slot2.start)) {
                    return `Time ranges ${slot1.rangeIndex + 1} and ${slot2.rangeIndex + 1} create overlapping slots`;
                }
            }
        }

        return null;
    };

    const addTempSlot = () => {
        // Get the last slot to use as template
        const lastSlot = tempSlots[tempSlots.length - 1];
        const newStartTime = lastSlot.endTime;

        // Calculate end time based on the same duration
        const [hours, minutes] = newStartTime.split(":").map(Number);
        let newEndMinutes = hours * 60 + minutes + lastSlot.duration;

        // Cap at 23:59
        if (newEndMinutes >= 24 * 60) {
            newEndMinutes = 23 * 60 + 59;
        }

        const newEndHour = Math.floor(newEndMinutes / 60);
        const newEndMin = newEndMinutes % 60;
        const newEndTime = `${newEndHour.toString().padStart(2, "0")}:${newEndMin.toString().padStart(2, "0")}`;

        setTempSlots([
            ...tempSlots,
            {
                startTime: newStartTime,
                endTime: newEndTime,
                duration: lastSlot.duration, // Use same duration as previous slot
                tempId: Date.now().toString()
            },
        ]);
    };

    const removeTempSlot = (tempId: string) => {
        setTempSlots(tempSlots.filter((s) => s.tempId !== tempId));
    };

    const updateTempSlot = (tempId: string, field: "startTime" | "endTime" | "duration", value: string | number) => {
        setTempSlots(
            tempSlots.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s))
        );
    };

    const calculateSlotsFromRange = (startTime: string, endTime: string, duration: number): number => {
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const totalMinutes = endMinutes - startMinutes;

        if (totalMinutes <= 0 || duration <= 0) return 0;

        // Calculate full slots
        const fullSlots = Math.floor(totalMinutes / duration);
        // Check if there's a remainder that creates an additional slot
        const remainder = totalMinutes % duration;

        return remainder > 0 ? fullSlots + 1 : fullSlots;
    };

    const saveDaySlots = async () => {
        // Validate all temp slots (no need for toast, handled inline)
        for (const slot of tempSlots) {
            const error = validateTimeSlot(slot.startTime, slot.endTime);
            if (error) {
                return;
            }
            // Additional validation: duration must be positive and not exceed slot range
            const [startHour, startMin] = slot.startTime.split(":").map(Number);
            const [endHour, endMin] = slot.endTime.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const slotDuration = endMinutes - startMinutes;
            if (slot.duration <= 0) {
                return;
            }
            if (slot.duration > slotDuration) {
                return;
            }
        }

        // Check for overlapping slots
        const overlapError = checkOverlappingSlots();
        if (overlapError) {
            toast.error(overlapError);
            return;
        }

        // Check total doesn't exceed 24 hours
        const { totalMinutes } = calculateTotalHours(tempSlots);
        if (totalMinutes > 24 * 60) {
            toast.error("Total time cannot exceed 24 hours");
            return;
        }

        try {
            setSaving(true);

            // Delete existing slots for this day
            const existingDaySlots = getDaySlots(selectedDay);
            for (const slot of existingDaySlots) {
                await fetch(`/api/appointments/slots?slotId=${slot.id}`, {
                    method: "DELETE",
                });
            }

            // Add new slots - split based on duration
            for (const slot of tempSlots) {
                const [startHour, startMin] = slot.startTime.split(":").map(Number);
                const [endHour, endMin] = slot.endTime.split(":").map(Number);

                let currentMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                while (currentMinutes < endMinutes) {
                    const slotStartHour = Math.floor(currentMinutes / 60);
                    const slotStartMin = currentMinutes % 60;

                    // Calculate slot end time - use duration or remaining time, whichever is smaller
                    const remainingMinutes = endMinutes - currentMinutes;
                    const actualDuration = Math.min(slot.duration, remainingMinutes);
                    const slotEndMinutes = currentMinutes + actualDuration;
                    const slotEndHour = Math.floor(slotEndMinutes / 60);
                    const slotEndMin = slotEndMinutes % 60;

                    const startTimeStr = `${slotStartHour.toString().padStart(2, "0")}:${slotStartMin.toString().padStart(2, "0")}`;
                    const endTimeStr = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMin.toString().padStart(2, "0")}`;

                    const response = await fetch("/api/appointments/slots", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            dayOfWeek: selectedDay,
                            startTime: startTimeStr,
                            endTime: endTimeStr,
                            isAvailable: true,
                        }),
                    });

                    const data = await response.json();
                    if (!data.success) {
                        throw new Error(data.message || "Failed to save slot");
                    }

                    currentMinutes += actualDuration;
                }
            }

            toast.success(`Slots saved for ${DAYS[selectedDay].label}`);
            await fetchSlots();
            // Reset temp slots after successful save
            setTempSlots([{ startTime: "09:00", endTime: "17:00", duration: 60, tempId: Date.now().toString() }]);
        } catch (error: any) {
            toast.error(error.message || "Failed to save slots");
        } finally {
            setSaving(false);
        }
    };

    const deleteSlot = async (slotId: string) => {
        try {
            const response = await fetch(`/api/appointments/slots?slotId=${slotId}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Slot deleted");
                await fetchSlots();
            } else {
                toast.error("Failed to delete slot");
            }
        } catch (error) {
            toast.error("Failed to delete slot");
        }
    };

    const deleteSelectedSlots = async () => {
        if (selectedSlots.size === 0) return;

        try {
            for (const slotId of selectedSlots) {
                await fetch(`/api/appointments/slots?slotId=${slotId}`, {
                    method: "DELETE",
                });
            }
            toast.success(`${selectedSlots.size} slot(s) deleted`);
            setSelectedSlots(new Set());
            await fetchSlots();
        } catch (error) {
            toast.error("Failed to delete slots");
        }
    };

    const toggleSlotSelection = (slotId: string) => {
        const newSelection = new Set(selectedSlots);
        if (newSelection.has(slotId)) {
            newSelection.delete(slotId);
        } else {
            newSelection.add(slotId);
        }
        setSelectedSlots(newSelection);
    };

    const toggleSelectAll = () => {
        const currentDaySlots = getDaySlots(selectedDay);
        if (selectedSlots.size === currentDaySlots.length) {
            setSelectedSlots(new Set());
        } else {
            setSelectedSlots(new Set(currentDaySlots.map(s => s.id)));
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const currentDaySlots = getDaySlots(selectedDay);
    const currentTotal = calculateTotalHours(currentDaySlots);
    const tempTotal = calculateTotalHours(tempSlots);
    // Validation for all temp slots
    let slotValidationError: string | null = null;
    for (const slot of tempSlots) {
        const error = validateTimeSlot(slot.startTime, slot.endTime);
        if (error) {
            slotValidationError = error;
            break;
        }
        const [startHour, startMin] = slot.startTime.split(":").map(Number);
        const [endHour, endMin] = slot.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const slotDuration = endMinutes - startMinutes;
        if (slot.duration <= 0) {
            slotValidationError = "Duration must be greater than 0";
            break;
        }
        if (slot.duration > slotDuration) {
            slotValidationError = "Duration cannot be greater than the slot time range";
            break;
        }
    }
    const hasOverlap = checkOverlappingSlots() !== null;

    return (
        <Card className="border-0 max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-vijad-gold" />
                    Manage Appointment Slots
                </CardTitle>
                <CardDescription className="text-sm">
                    Configure available time slots for each day of the week
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                    <TabsList className="grid grid-cols-7 mb-6 w-full">
                        {DAYS.map((day) => (
                            <TabsTrigger key={day.value} value={day.value.toString()} className="text-xs sm:text-sm px-1 sm:px-3">
                                {day.label.substring(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {DAYS.map((day) => (
                        <TabsContent key={day.value} value={day.value.toString()} className="space-y-6">
                            {/* Current Slots */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                        <span>Current Slots for {day.label}</span>
                                        {currentDaySlots.length > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                {currentTotal.hours}h {currentTotal.minutes}m total
                                            </Badge>
                                        )}
                                    </h3>
                                    {/* Show error message near total time if invalid */}
                                    {slotValidationError && (
                                        <span style={{ color: 'red', fontSize: '0.9em', fontWeight: 500 }}>
                                            {slotValidationError}
                                        </span>
                                    )}
                                    {currentDaySlots.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={toggleSelectAll}
                                                className="text-xs"
                                            >
                                                {selectedSlots.size === currentDaySlots.length ? (
                                                    <>
                                                        <CheckSquare className="w-3 h-3 mr-1" />
                                                        Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className="w-3 h-3 mr-1" />
                                                        Select All
                                                    </>
                                                )}
                                            </Button>
                                            {selectedSlots.size > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={deleteSelectedSlots}
                                                    className="text-xs"
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                                    {/* Unified error display */}
                                                    {slotValidationError && (
                                                        <Badge variant="destructive" className="text-xs flex items-center">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            {slotValidationError}
                                                        </Badge>
                                                    )}
                                                    {hasOverlap && (
                                                        <Badge variant="destructive" className="text-xs flex items-center">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Overlapping times
                                                        </Badge>
                                                    )}
                                                    {tempTotal.totalMinutes > 24 * 60 && (
                                                        <Badge variant="destructive" className="text-xs flex items-center">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Exceeds 24h
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                        {tempTotal.hours}h {tempTotal.minutes}m
                                                    </Badge>
                                                </div>
                                        </div>
                                    )}
                                </div>

                                {currentDaySlots.length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                        <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No slots configured for this day</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {currentDaySlots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 rounded-lg bg-card transition-shadow hover:shadow-md cursor-pointer"
                                                onClick={() => toggleSlotSelection(slot.id)}
                                            >
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="shrink-0">
                                                        {selectedSlots.has(slot.id) ? (
                                                            <CheckSquare className="w-5 h-5 text-vijad-gold" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <span className="font-medium text-sm sm:text-base">
                                                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                    </span>
                                                    <Badge variant={slot.isAvailable ? "default" : "secondary"} className="text-xs">
                                                        {slot.isAvailable ? "Available" : "Unavailable"}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSlot(slot.id);
                                                    }}
                                                    className="self-end sm:self-auto"
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold">Add New Slots</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                            <Badge variant="outline" className="text-xs">
                                                {tempTotal.hours}h {tempTotal.minutes}m
                                            </Badge>
                                        </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {tempSlots.map((slot, index) => {
                                        const slotCount = calculateSlotsFromRange(slot.startTime, slot.endTime, slot.duration);
                                        return (
                                            <div key={slot.tempId} className="space-y-2 p-3 rounded-lg bg-muted/30 transition-shadow hover:shadow-md">
                                                <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
                                                    <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                                                        <div className="space-y-1 sm:space-y-2">
                                                            <Label className="text-xs sm:text-sm">Start Time</Label>
                                                            <Input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) =>
                                                                    updateTempSlot(slot.tempId, "startTime", e.target.value)
                                                                }
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1 sm:space-y-2">
                                                            <Label className="text-xs sm:text-sm">End Time</Label>
                                                            <Input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) =>
                                                                    updateTempSlot(slot.tempId, "endTime", e.target.value)
                                                                }
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:w-32">
                                                        <Label className="text-xs sm:text-sm">Duration (min)</Label>
                                                        <Select
                                                            value={slot.duration.toString()}
                                                            onValueChange={(value) => updateTempSlot(slot.tempId, "duration", parseInt(value))}
                                                        >
                                                            <SelectTrigger className="text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="10">10 min</SelectItem>
                                                                <SelectItem value="20">20 min</SelectItem>
                                                                <SelectItem value="30">30 min</SelectItem>
                                                                <SelectItem value="40">40 min</SelectItem>
                                                                <SelectItem value="50">50 min</SelectItem>
                                                                <SelectItem value="60">1 hour</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {tempSlots.length > 1 && (
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => removeTempSlot(slot.tempId)}
                                                            className="self-end sm:self-auto"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {slotCount > 0 && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Will create {slotCount} bookable slot{slotCount !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button variant="outline" onClick={addTempSlot} className="w-full sm:flex-1">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Another Slot
                                    </Button>
                                    <Button
                                        onClick={saveDaySlots}
                                        disabled={saving || tempTotal.totalMinutes > 24 * 60 || hasOverlap || !!slotValidationError}
                                        className="w-full sm:flex-1 bg-vijad-gold hover:bg-vijad-gold/90 text-vijad-dark"
                                    >
                                        {saving ? "Saving..." : `Save Slots`}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
