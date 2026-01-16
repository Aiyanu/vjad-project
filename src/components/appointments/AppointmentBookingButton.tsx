"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, X } from "lucide-react";
import { AppointmentCalendar } from "./AppointmentCalendar";

export function AppointmentBookingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 left-0 bg-white rounded-lg shadow-2xl p-4 w-80 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Book an Appointment</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <AppointmentCalendar compact={true} showLegend={false} />
            </div>

            <Link href="/appointments" className="block">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue to Booking
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        title="Book an appointment"
      >
        <Calendar className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
