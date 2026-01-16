"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Mail, Phone, CheckCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing-page/Navbar";
import { Footer } from "@/components/landing-page/Footer";
import { toast } from "sonner";
import { format, addDays, isBefore, startOfToday } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Appointments() {
  const [step, setStep] = useState(1); // Multi-step form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availability, setAvailability] = useState<{ dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      fetchBookedSlots(date);
      generateTimeSlots(date);
    }
  }, [date, availability]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/appointments/slots");
      const data = await response.json();

      if (data.success) {
        setAvailability(data.slots);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const fetchBookedSlots = async (selectedDate: Date) => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/appointments/get-slots?date=${dateStr}`);
      const data = await response.json();

      if (data.success) {
        const booked = data.availableSlots
          .filter((slot: any) => !slot.available)
          .map((slot: any) => slot.time);
        setBookedSlots(booked);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  const generateTimeSlots = (selectedDate: Date) => {
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter((a) => a.dayOfWeek === dayOfWeek);

    if (dayAvailability.length === 0) {
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];

    dayAvailability.forEach((avail) => {
      const [startHour, startMinute] = avail.startTime.split(":").map(Number);
      const [endHour, endMinute] = avail.endTime.split(":").map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`;
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
              <p className="text-xl font-semibold text-vijad-gold mb-6">
                {date && format(date, "EEEE, MMMM d, yyyy")} at {formatTimeDisplay(selectedTime)}
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
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Calendar Section */}
                  <div className="bg-background rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Calendar className="w-6 h-6 text-vijad-gold" />
                      Select Date
                    </h2>

                    <div className="bg-card rounded-lg p-4 mb-6 inline-block">
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
                        className="[&_.rdp]:w-auto [&_.rdp-months]:w-auto [&_.rdp-month]:w-auto [&_.rdp-caption]:text-sm [&_.rdp-caption]:font-semibold [&_.rdp-cell]:p-0 [&_.rdp-cell]:w-10 [&_.rdp-day]:w-10 [&_.rdp-day]:h-10 [&_.rdp-day]:text-sm [&_.rdp-day_button]:w-full [&_.rdp-day_button]:h-full [&_.rdp-day_button]:text-foreground [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:rounded-md [&_.rdp-day_button:hover]:bg-vijad-gold/10 [&_.rdp-day_selected]:bg-vijad-gold [&_.rdp-day_selected]:text-vijad-dark [&_.rdp-day_today]:border-2 [&_.rdp-day_today]:border-vijad-gold"
                      />
                    </div>

                    {/* Legend */}
                    <div className="bg-card rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Legend</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-green-100 border-2 border-green-300"></div>
                          <span className="text-sm text-muted-foreground">Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-orange-100 border-2 border-orange-300"></div>
                          <span className="text-sm text-muted-foreground">Booked</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-gray-100 border-2 border-gray-300"></div>
                          <span className="text-sm text-muted-foreground">Unavailable</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div className="bg-background rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Clock className="w-6 h-6 text-vijad-gold" />
                      Select Time
                    </h2>

                    {!date ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Please select a date first</p>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg text-orange-900">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm">No available times for this date</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-4">
                          Available times for {format(date, "EEEE, MMM d")}
                        </p>
                        <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                          {timeSlots.map((slot) => (
                            <motion.button
                              key={slot.time}
                              whileHover={{ scale: slot.available ? 1.05 : 1 }}
                              type="button"
                              onClick={() => slot.available && setSelectedTime(slot.time)}
                              className={`p-4 rounded-lg font-medium text-sm transition-all ${selectedTime === slot.time
                                  ? "bg-vijad-gold text-vijad-dark shadow-md border-2 border-vijad-gold"
                                  : slot.available
                                    ? "bg-green-50 text-green-900 border border-green-200 hover:border-green-400 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                              disabled={!slot.available}
                              title={slot.available ? "Available" : "Booked"}
                            >
                              {formatTimeDisplay(slot.time)}
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Selected Date and Time Preview */}
                    {date && selectedTime && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-vijad-gold/10 rounded-lg border border-vijad-gold/20"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-vijad-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              Selected Appointment
                            </p>
                            <p className="text-vijad-gold font-medium">
                              {format(date, "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-vijad-gold font-medium">
                              {formatTimeDisplay(selectedTime)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Next Button */}
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!date || !selectedTime}
                      className="w-full mt-6 bg-vijad-gold text-vijad-dark hover:bg-vijad-gold/90"
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
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <User className="w-6 h-6 text-vijad-gold" />
                      Your Information
                    </CardTitle>
                    <CardDescription>
                      Please provide your contact details to complete the booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Selected Appointment Summary */}
                    {date && selectedTime && (
                      <div className="mb-6 p-4 bg-vijad-gold/10 rounded-lg border border-vijad-gold/20">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-vijad-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              Selected Appointment
                            </p>
                            <p className="text-[hsl(var(--primary))] font-medium">
                              {format(date, "EEEE, MMMM d, yyyy")} at {formatTimeDisplay(selectedTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 text-base">
                          <User className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.visitorName}
                          onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                          placeholder="Enter your full name"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-base">
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
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-base">
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
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base">Additional Notes</Label>
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
                          size="lg"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-primary hover:bg-primary/90"
                          disabled={isSubmitting}
                          size="lg"
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
