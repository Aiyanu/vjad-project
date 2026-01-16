/**
 * Appointment Booking Form Component
 * Collects visitor information and submits booking
 */

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, User, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { timeRangeToReadable } from "@/lib/bookingHelpers";
import type { TimeSlotInfo } from "@/types/booking";

const bookingFormSchema = z.object({
    visitorName: z.string().min(2, "Name must be at least 2 characters"),
    visitorEmail: z.string().email("Invalid email address"),
    visitorPhone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
    message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
    date: string; // YYYY-MM-DD
    timeSlot: TimeSlotInfo;
    onSuccess?: (bookingId: string) => void;
    onCancel?: () => void;
}

export function BookingForm({
    date,
    timeSlot,
    onSuccess,
    onCancel,
}: BookingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
    });

    const onSubmit = async (data: BookingFormData) => {
        try {
            setIsSubmitting(true);

            const response = await fetch("/api/appointments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    appointmentDate: date,
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
                toast.success("Appointment booked successfully!");
                onSuccess?.(result.booking.id);
                reset();
            } else {
                toast.error(result.error || "Failed to book appointment");
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                </h3>
                <p className="text-gray-600 mb-6">
                    Your appointment has been successfully booked. You will receive a
                    confirmation email shortly.
                </p>
                <Button onClick={() => window.location.reload()}>
                    Book Another Appointment
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Booking Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Appointment Details</h3>
                <div className="space-y-1 text-sm text-blue-800">
                    <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <p>
                        <span className="font-medium">Time:</span>{" "}
                        {timeRangeToReadable(timeSlot.startTime, timeSlot.endTime)}
                    </p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <Label htmlFor="visitorName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name *
                    </Label>
                    <Input
                        id="visitorName"
                        {...register("visitorName")}
                        placeholder="John Doe"
                        className="mt-1"
                    />
                    {errors.visitorName && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.visitorName.message}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <Label htmlFor="visitorEmail" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                    </Label>
                    <Input
                        id="visitorEmail"
                        type="email"
                        {...register("visitorEmail")}
                        placeholder="john@example.com"
                        className="mt-1"
                    />
                    {errors.visitorEmail && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.visitorEmail.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <Label htmlFor="visitorPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                    </Label>
                    <Input
                        id="visitorPhone"
                        type="tel"
                        {...register("visitorPhone")}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                    />
                    {errors.visitorPhone && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.visitorPhone.message}
                        </p>
                    )}
                </div>

                {/* Message */}
                <div>
                    <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Additional Notes (Optional)
                    </Label>
                    <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Any specific requirements or questions..."
                        className="mt-1 min-h-25"
                    />
                    {errors.message && (
                        <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                        </>
                    ) : (
                        "Confirm Booking"
                    )}
                </Button>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
                By confirming, you agree to receive appointment reminders via email and SMS.
            </p>
        </form>
    );
}
