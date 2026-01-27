"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, User, Mail, Phone } from "lucide-react";
import { Navbar } from "@/components/landing-page/Navbar";
import { Footer } from "@/components/landing-page/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { toast } from "sonner";

interface AppointmentSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function AppointmentsPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState<AppointmentSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [dayAvailability, setDayAvailability] = useState<Record<string, { total: number; available: number }>>({});
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    message: "",
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (date) {
      generateTimeSlots();
    }
  }, [date, availability]);

  // Preload day availability for next 30 days
  useEffect(() => {
    if (availability.length > 0 && !isLoadingAvailability) {
      preloadDayAvailability();
    }
  }, [availability, isLoadingAvailability]);

  const preloadDayAvailability = async () => {
    const today = startOfToday();
    const promises = [];

    for (let i = 0; i < 30; i++) {
      const checkDate = addDays(today, i);
      const dayOfWeek = checkDate.getDay();
      const hasSlots = availability.some((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);

      if (hasSlots) {
        promises.push(fetchDayAvailability(checkDate));
      }
    }

    await Promise.all(promises);
  };

  const fetchDayAvailability = async (checkDate: Date) => {
    try {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const dayOfWeek = checkDate.getDay();

      const daySlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable);
      if (daySlots.length === 0) return;

      const response = await fetch(`/api/appointments/book?date=${dateStr}`);
      const data = await response.json();
      const bookedSlots = data.bookings?.map((b: any) => b.startTime) || [];

      let totalSlots = 0;
      daySlots.forEach((slot) => {
        const [startHour, startMin] = slot.startTime.split(":").map(Number);
        const [endHour, endMin] = slot.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        totalSlots += Math.floor((endMinutes - startMinutes) / 30);
      });

      const availableCount = totalSlots - bookedSlots.length;

      setDayAvailability(prev => ({
        ...prev,
        [dateStr]: { total: totalSlots, available: availableCount }
      }));
    } catch (error) {
      // Silently fail for preloading
    }
  };

  const fetchAvailability = async () => {
    try {
      setIsLoadingAvailability(true);
      const response = await fetch("/api/appointments/slots");
      const data = await response.json();
      if (data.success) {
        setAvailability(data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const generateTimeSlots = async () => {
    if (!date) return;

    setIsLoadingTimeSlots(true);
    try {
      const dayOfWeek = date.getDay();
      const dateStr = format(date, "yyyy-MM-dd");

      // Get slots for this day of week
      const daySlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable);

      if (daySlots.length === 0) {
        setTimeSlots([]);
        return;
      }

      // Fetch existing bookings for this date
      const response = await fetch(`/api/appointments/book?date=${dateStr}`);
      const data = await response.json();
      const bookedSlots = data.bookings?.map((b: any) => b.startTime) || [];

      const slots: TimeSlot[] = [];

      daySlots.forEach((slot) => {
        const [startHour, startMin] = slot.startTime.split(":").map(Number);
        const [endHour, endMin] = slot.endTime.split(":").map(Number);

        let currentHour = startHour;
        let currentMinute = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMin)) {
          const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
          const isBooked = bookedSlots.includes(timeString);

          slots.push({
            time: timeString,
            available: !isBooked,
          });

          currentMinute += 30;
          if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
          }
        }
      });

      setTimeSlots(slots);

      // Track day availability
      const availableCount = slots.filter(s => s.available).length;
      setDayAvailability(prev => ({
        ...prev,
        [dateStr]: { total: slots.length, available: availableCount }
      }));
    } catch (error) {
      console.error("Error generating time slots:", error);
      toast.error("Failed to load time slots");
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, startOfToday())) return true;
    const dayOfWeek = date.getDay();
    return !availability.some((a) => a.dayOfWeek === dayOfWeek && a.isAvailable);
  };

  const getDayAvailabilityStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayData = dayAvailability[dateStr];

    if (!dayData) return null;

    if (dayData.available === 0) return "fully-booked";
    if (dayData.available < dayData.total * 0.3) return "limited";
    return "available";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!formData.visitorName || !formData.visitorEmail || !formData.visitorPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const [hours, minutes] = selectedTime.split(":");
      const endHour = parseInt(hours) + (parseInt(minutes) === 30 ? 1 : 0);
      const endMinute = (parseInt(minutes) + 30) % 60;

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: formData.visitorName,
          visitorEmail: formData.visitorEmail,
          visitorPhone: formData.visitorPhone,
          appointmentDate: date,
          startTime: selectedTime,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}:00`,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success("Appointment booked successfully!");
      } else {
        toast.error(data.message || "Failed to book appointment");
      }
    } catch (error: any) {
      toast.error(error.message || "Error booking appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 bg-vijad-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-vijad-gold" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Appointment Confirmed!</h1>
              <p className="text-muted-foreground mb-2">
                Your appointment has been scheduled for:
              </p>
              <p className="text-xl font-semibold text-vijad-gold mb-2">
                {date && format(date, "EEEE, MMMM d, yyyy")} at {formatTimeDisplay(selectedTime)}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Duration: 30 minutes
              </p>
              <p className="text-muted-foreground mb-8">
                A confirmation email will be sent to {formData.visitorEmail}
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Book an <span className="text-vijad-gold">Appointment</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Schedule a consultation with our team. Select your preferred date and time below.
            </p>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 1 ? 'bg-vijad-gold text-vijad-dark' : step > 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                </div>
                <span className={`font-medium ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Select Date & Time
                </span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step === 2 ? 'bg-vijad-gold text-vijad-dark' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className={`font-medium ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Your Information
                </span>
              </div>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Step 1: Date and Time Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar Section */}
                  <div className="space-y-4 flex flex-col items-center">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <CalendarIcon className="w-5 h-5 text-vijad-gold" />
                      Select Date
                    </h3>
                    {isLoadingAvailability ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vijad-gold mb-4"></div>
                        <p className="text-muted-foreground text-sm">Loading available dates...</p>
                      </div>
                    ) : (
                      <div className="flex justify-center w-full">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setSelectedTime("");
                          }}
                          disabled={isDateDisabled}
                          fromDate={startOfToday()}
                          toDate={addDays(new Date(), 60)}
                          className="rounded-md scale-90 origin-top w-full max-w-xs"
                        />
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-muted/50 p-2 rounded-lg w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-vijad-gold"></div>
                        <span className="text-muted-foreground text-[11px]">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                        <span className="text-muted-foreground text-[11px]">Limited</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-muted-foreground text-[11px]">Fully Booked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                        <span className="text-muted-foreground text-[11px]">Unavailable</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="w-full">
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="w-5 h-5 text-vijad-gold" />
                        Select Time
                      </h3>
                      {date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Available times for {format(date, "EEEE, MMM d")}
                        </p>
                      )}
                    </div>

                    {!date ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <CalendarIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Please select a date first</p>
                      </div>
                    ) : isLoadingTimeSlots ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vijad-gold mb-4"></div>
                        <p className="text-muted-foreground text-sm">Loading available times...</p>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg text-orange-900">
                        <p className="text-sm">No available times for this date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-87.5 overflow-y-auto pr-2 w-full">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            disabled={!slot.available}
                            className={`text-sm h-9 w-full ${selectedTime === slot.time ? "bg-vijad-gold hover:bg-vijad-gold/90 text-vijad-dark" : ""}`}
                          >
                            {formatTimeDisplay(slot.time)}
                          </Button>
                        ))}
                      </div>
                    )}
                    {date && selectedTime && (
                      <div className="mt-4 p-4 bg-vijad-gold/10 rounded-lg border border-vijad-gold/20 w-full">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Selected Appointment
                        </p>
                        <p className="text-vijad-gold font-medium">
                          {format(date, "EEEE, MMMM d, yyyy")} at {formatTimeDisplay(selectedTime)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: 30 minutes
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!date || !selectedTime}
                      className="w-full bg-vijad-gold text-vijad-dark hover:bg-vijad-gold/90"
                      size="lg"
                    >
                      Continue to Information
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-2xl mx-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-vijad-gold" />
                      Your Information
                    </CardTitle>
                    <CardDescription>
                      Please provide your contact details to complete the booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {date && selectedTime && (
                      <div className="mb-6 p-4 bg-vijad-gold/10 rounded-lg border border-vijad-gold/20">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Selected Appointment
                        </p>
                        <p className="text-vijad-gold font-medium">
                          {format(date, "EEEE, MMMM d, yyyy")} at {formatTimeDisplay(selectedTime)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: 30 minutes
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.visitorName}
                          onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.visitorEmail}
                          onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.visitorPhone}
                          onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Any specific topics you'd like to discuss?"
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-vijad-gold hover:bg-vijad-gold/90 text-vijad-dark"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Booking..." : "Confirm Appointment"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
