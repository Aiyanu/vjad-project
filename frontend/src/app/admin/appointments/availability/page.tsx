"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, addDays, startOfToday } from "date-fns";

interface TimeBlock {
  id?: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  date: Date;
  blocks: TimeBlock[];
  expanded: boolean;
}

const PRESET_DURATION = 60; // Fixed 1 hour duration for all slots

export default function ManageAvailability() {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New day form state
  const [selectedNewDate, setSelectedNewDate] = useState<string>("");
  const [newDayBlocks, setNewDayBlocks] = useState<TimeBlock[]>([{ startTime: "09:00", endTime: "10:00" }]);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/availability");
      const data = await response.json();
      if (data.success) {
        const formattedAvailability = data.availability.map((item: any) => ({
          date: new Date(item.date),
          expanded: true,
          blocks: item.timeBlocks.map((block: any) => ({
            id: block.id,
            startTime: block.startTime.substring(0, 5), // Remove seconds
            endTime: block.endTime.substring(0, 5),
          })),
        }));
        setAvailability(formattedAvailability);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setIsLoading(false);
    }
  };

  const getUsedDates = () => {
    return availability.map((item) => format(item.date, "yyyy-MM-dd"));
  };

  const getAvailableDates = () => {
    const usedDates = getUsedDates();
    const dates: { value: string; label: string }[] = [];

    for (let i = 0; i < 60; i++) {
      const date = addDays(startOfToday(), i);
      const dateStr = format(date, "yyyy-MM-dd");

      // Filter out already saved dates AND the currently selected date
      if (!usedDates.includes(dateStr) && dateStr !== selectedNewDate) {
        dates.push({
          value: dateStr,
          label: format(date, "EEEE, MMMM d, yyyy"),
        });
      }
    }

    return dates;
  };

  const addNewDay = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedNewDate(dateStr);
    setNewDayBlocks([{ startTime: "09:00", endTime: "10:00" }]);
  };

  const addBlockToNewDay = () => {
    setNewDayBlocks([...newDayBlocks, { startTime: "09:00", endTime: "10:00" }]);
  };

  const removeBlockFromNewDay = (blockIndex: number) => {
    if (newDayBlocks.length === 1) {
      toast.error("Must have at least one time block");
      return;
    }
    setNewDayBlocks(newDayBlocks.filter((_, index) => index !== blockIndex));
  };

  const updateNewDayBlock = (blockIndex: number, field: "startTime" | "endTime", value: string) => {
    setNewDayBlocks(
      newDayBlocks.map((block, index) =>
        index === blockIndex ? { ...block, [field]: value } : block
      )
    );
  };

  const saveNewDay = () => {
    if (!selectedNewDate) return;

    const newDate = new Date(selectedNewDate + "T00:00:00");

    setAvailability([
      ...availability,
      {
        date: newDate,
        expanded: true,
        blocks: newDayBlocks,
      },
    ]);

    // Reset form
    setSelectedNewDate("");
    setNewDayBlocks([{ startTime: "09:00", endTime: "10:00" }]);

    toast.success(`Added ${format(newDate, "MMM d, yyyy")}`);
  };

  const cancelNewDay = () => {
    setSelectedNewDate("");
    setNewDayBlocks([{ startTime: "09:00", endTime: "10:00" }]);
  };

  const toggleDayExpanded = (date: Date) => {
    setAvailability(
      availability.map((item) =>
        format(item.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  const removeDay = async (date: Date) => {
    try {
      const response = await fetch(
        `/api/admin/availability?date=${format(date, "yyyy-MM-dd")}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setAvailability(
          availability.filter(
            (item) => format(item.date, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")
          )
        );
        toast.success("Day removed successfully");
      } else {
        toast.error(data.message || "Failed to remove day");
      }
    } catch (error) {
      toast.error("Error removing day");
    }
  };

  const addTimeBlock = (date: Date) => {
    setAvailability(
      availability.map((item) =>
        format(item.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          ? {
            ...item,
            blocks: [
              ...item.blocks,
              { startTime: "09:00", endTime: "10:00" },
            ],
          }
          : item
      )
    );
  };

  const removeTimeBlock = (date: Date, blockIndex: number) => {
    setAvailability(
      availability.map((item) =>
        format(item.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          ? {
            ...item,
            blocks: item.blocks.filter((_, index) => index !== blockIndex),
          }
          : item
      )
    );
  };

  const updateTimeBlock = (
    date: Date,
    blockIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability(
      availability.map((item) =>
        format(item.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          ? {
            ...item,
            blocks: item.blocks.map((block, index) =>
              index === blockIndex ? { ...block, [field]: value } : block
            ),
          }
          : item
      )
    );
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    try {
      // Save each date's availability
      for (const dayAvail of availability) {
        // Check if this date already exists in the database
        const existingResponse = await fetch("/api/admin/availability");
        const existingData = await existingResponse.json();

        const existsInDb = existingData.success && existingData.availability.some(
          (item: any) => format(new Date(item.date), "yyyy-MM-dd") === format(dayAvail.date, "yyyy-MM-dd")
        );

        if (existsInDb) {
          // Delete and recreate
          await fetch(`/api/admin/availability?date=${format(dayAvail.date, "yyyy-MM-dd")}`, {
            method: "DELETE",
          });
        }

        const response = await fetch("/api/admin/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: format(dayAvail.date, "yyyy-MM-dd"),
            blocks: dayAvail.blocks.map((block) => ({
              startTime: `${block.startTime}:00`,
              endTime: `${block.endTime}:00`,
              durationMinutes: PRESET_DURATION,
            })),
          }),
        });

        const data = await response.json();
        if (!data.success) {
          toast.error(`Failed to save ${format(dayAvail.date, "MMM d")}: ${data.message}`);
          setIsSaving(false);
          return;
        }
      }

      toast.success("All availability saved successfully");
      fetchAvailability();
    } catch (error) {
      toast.error("Error saving availability");
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlotPreview = (blocks: TimeBlock[]) => {
    const slots: string[] = [];

    blocks.forEach((block) => {
      const [startHour, startMinute] = block.startTime.split(":").map(Number);
      const [endHour, endMinute] = block.endTime.split(":").map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        let slotEndMinute = currentMinute + PRESET_DURATION;
        let slotEndHour = currentHour;

        if (slotEndMinute >= 60) {
          slotEndHour += Math.floor(slotEndMinute / 60);
          slotEndMinute = slotEndMinute % 60;
        }

        if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMinute > endMinute)) {
          break;
        }

        slots.push(
          `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")} - ${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`
        );

        currentMinute += PRESET_DURATION;
        if (currentMinute >= 60) {
          currentMinute = currentMinute % 60;
          currentHour++;
        }
      }
    });

    return slots;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-vijad-gold" />
              Appointment Availability
            </h1>
            <p className="text-muted-foreground">
              Set your available time slots for appointments
            </p>
          </div>
          {availability.length > 0 && (
            <Button
              onClick={saveAvailability}
              disabled={isSaving}
              size="lg"
              className="bg-vijad-gold text-vijad-dark hover:bg-vijad-gold/90"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Saving..." : "Save Availability"}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Add Time Slots Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Add Time Slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Day</Label>
            <Select value={selectedNewDate} onValueChange={addNewDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a date..." />
              </SelectTrigger>
              <SelectContent>
                {availableDates.length === 0 ? (
                  <SelectItem value="none" disabled>
                    All dates in next 60 days are used
                  </SelectItem>
                ) : (
                  availableDates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Time blocks for new day */}
          {selectedNewDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 pt-2"
            >
              {newDayBlocks.map((block, blockIndex) => (
                <div key={blockIndex} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-2 block">From</Label>
                    <Input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => updateNewDayBlock(blockIndex, "startTime", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium mb-2 block">To</Label>
                    <Input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => updateNewDayBlock(blockIndex, "endTime", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addBlockToNewDay}
                    className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeBlockFromNewDay(blockIndex)}
                    className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={newDayBlocks.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Save/Cancel buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={saveNewDay}
                  className="flex-1 bg-vijad-gold text-vijad-dark hover:bg-vijad-gold/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Availability
                </Button>
                <Button onClick={cancelNewDay} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Existing Days */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      ) : availability.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No availability set yet. Add a date to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {availability
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((dayAvail, dayIndex) => (
                <motion.div
                  key={format(dayAvail.date, "yyyy-MM-dd")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: dayIndex * 0.05 }}
                >
                  <Card>
                    <CardHeader className="cursor-pointer" onClick={() => toggleDayExpanded(dayAvail.date)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {dayAvail.expanded ? (
                            <ChevronUp className="w-5 h-5 text-vijad-gold" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-vijad-gold" />
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              {format(dayAvail.date, "EEEE")}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {format(dayAvail.date, "MMMM d, yyyy")} • {dayAvail.blocks.length} block(s)
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDay(dayAvail.date);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {dayAvail.expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <CardContent className="space-y-4 pt-0">
                            {/* Time Blocks */}
                            {dayAvail.blocks.map((block, blockIndex) => (
                              <div
                                key={blockIndex}
                                className="p-4 bg-muted/30 rounded-lg border"
                              >
                                <div className="flex items-end gap-4">
                                  <div className="flex-1">
                                    <Label className="text-xs font-medium mb-2 block">
                                      From
                                    </Label>
                                    <Input
                                      type="time"
                                      value={block.startTime}
                                      onChange={(e) =>
                                        updateTimeBlock(
                                          dayAvail.date,
                                          blockIndex,
                                          "startTime",
                                          e.target.value
                                        )
                                      }
                                      className="h-10"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs font-medium mb-2 block">
                                      To
                                    </Label>
                                    <Input
                                      type="time"
                                      value={block.endTime}
                                      onChange={(e) =>
                                        updateTimeBlock(
                                          dayAvail.date,
                                          blockIndex,
                                          "endTime",
                                          e.target.value
                                        )
                                      }
                                      className="h-10"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTimeBlock(dayAvail.date, blockIndex)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              variant="outline"
                              onClick={() => addTimeBlock(dayAvail.date)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Another Time Block
                            </Button>

                            {/* Slot Preview */}
                            {dayAvail.blocks.length > 0 && (
                              <div className="mt-4 p-4 bg-vijad-gold/10 rounded-lg border border-vijad-gold/20">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="w-4 h-4 text-vijad-gold" />
                                  <span className="font-semibold text-sm">
                                    Preview of Generated Slots (1 hour each):
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                  {generateSlotPreview(dayAvail.blocks).map((slot, index) => (
                                    <div
                                      key={index}
                                      className="text-xs bg-background px-3 py-2 rounded border font-medium"
                                    >
                                      {slot}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
