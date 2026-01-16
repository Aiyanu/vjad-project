"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AppointmentSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SlotsByDay {
  [key: number]: {
    dayName: string;
    slots: AppointmentSlot[];
  };
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AppointmentSlotManager() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsByDay, setSlotsByDay] = useState<SlotsByDay>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for adding new slot
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 0,
    startTime: "09:00",
    endTime: "10:00",
    isAvailable: true,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments/slots");
      const data = await response.json();

      if (data.success) {
        setSlots(data.slots);
        setSlotsByDay(data.slotsByDay);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load appointment slots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/appointments/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Appointment slot added");
        setNewSlot({
          dayOfWeek: 0,
          startTime: "09:00",
          endTime: "10:00",
          isAvailable: true,
        });
        fetchSlots();
      } else {
        toast.error(data.error || "Failed to add slot");
      }
    } catch (error: any) {
      console.error("Error adding slot:", error);
      toast.error("Error adding appointment slot");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    try {
      const response = await fetch("/api/appointments/slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Appointment slot deleted");
        fetchSlots();
      } else {
        toast.error("Failed to delete slot");
      }
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      toast.error("Error deleting appointment slot");
    }
  };

  const handleToggleAvailability = async (slot: AppointmentSlot) => {
    try {
      const response = await fetch("/api/appointments/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slot,
          isAvailable: !slot.isAvailable,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Slot marked as ${!slot.isAvailable ? "available" : "unavailable"}`
        );
        fetchSlots();
      }
    } catch (error: any) {
      console.error("Error updating slot:", error);
      toast.error("Error updating slot");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Slot Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[hsl(var(--primary))]/10">
            <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
              Add Available Appointment Slot
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Define when your team is available for appointments
            </p>
          </div>
        </div>

        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day Selection */}
            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <select
                id="day"
                value={newSlot.dayOfWeek}
                onChange={(e) =>
                  setNewSlot({
                    ...newSlot,
                    dayOfWeek: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Current Slots List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-elegant"
      >
        <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-6">
          Current Available Slots
        </h3>

        {slots.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            <p className="mb-2">No appointment slots configured yet.</p>
            <p className="text-sm">Add slots using the form above to enable bookings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySlots = slots.filter((s) => s.dayOfWeek === dayIndex);
              if (daySlots.length === 0) return null;

              return (
                <div key={dayIndex} className="border-t pt-4">
                  <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">
                    {dayName}
                  </h4>
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-[hsl(var(--muted))]/50 rounded-lg border border-[hsl(var(--border))]"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[hsl(var(--foreground))]">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Status:{" "}
                            <span
                              className={
                                slot.isAvailable
                                  ? "text-green-600 font-semibold"
                                  : "text-orange-600 font-semibold"
                              }
                            >
                              {slot.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAvailability(slot)}
                          >
                            {slot.isAvailable ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
