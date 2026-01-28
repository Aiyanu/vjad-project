import { apiSuccess, apiError } from "../lib/api-response";

export const updateAppointmentSlot = async (req: Request, res: Response) => {
  try {
    const { id, dayOfWeek, startTime, endTime, isAvailable } = req.body;
    if (
      typeof id !== "string" ||
      typeof dayOfWeek !== "number" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      typeof isAvailable !== "boolean"
    ) {
      return apiError(res, "Invalid slot data", 400);
    }
    const slot = await prisma.appointmentSlot.update({
      where: { id },
      data: { dayOfWeek, startTime, endTime, isAvailable },
    });
    return apiSuccess(res, slot, "Appointment slot updated");
  } catch (error: any) {
    if (error.code === "P2002") {
      return apiError(
        res,
        "Slot already exists for this day and time",
        409,
        error,
      );
    }
    if (error.code === "P2025") {
      return apiError(res, "Slot not found", 404, error);
    }
    return apiError(res, "Failed to update slot", 500, error);
  }
};
// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { prisma } from "../lib/db";

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany();
    return apiSuccess(res, { appointments }, "Appointments fetched");
  } catch (error) {
    console.error("[getAppointments]", error);
    return apiError(res, "Failed to fetch appointments", 500, error);
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return apiError(res, "Appointment not found", 404);
    return apiSuccess(res, { appointment }, "Appointment fetched");
  } catch (error) {
    console.error("[getAppointment]", error);
    return apiError(res, "Failed to fetch appointment", 500, error);
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const appointment = await prisma.appointment.create({ data });
    return apiSuccess(res, { appointment }, "Appointment created", 201);
  } catch (error) {
    console.error("[createAppointment]", error);
    return apiError(res, "Failed to create appointment", 500, error);
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const data = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
    });
    return apiSuccess(res, { appointment }, "Appointment updated");
  } catch (error) {
    console.error("[updateAppointment]", error);
    return apiError(res, "Failed to update appointment", 500, error);
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    await prisma.appointment.delete({ where: { id } });
    return apiSuccess(res, null, "Appointment deleted");
  } catch (error) {
    console.error("[deleteAppointment]", error);
    return apiError(res, "Failed to delete appointment", 500, error);
  }
};

// ─── AppointmentSlot Controllers ───
export const getAppointmentSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.appointmentSlot.findMany();
    const DAYS_OF_WEEK = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const slotsByDay: Record<number, { dayName: string; slots: any[] }> = {};
    for (let i = 0; i < 7; i++) {
      slotsByDay[i] = {
        dayName: DAYS_OF_WEEK[i],
        slots: slots.filter((s) => s.dayOfWeek === i),
      };
    }
    return apiSuccess(res, { slots, slotsByDay }, "Slots fetched");
  } catch (error) {
    console.error("[getAppointmentSlots]", error);
    return apiError(res, "Failed to fetch slots", 500, error);
  }
};

export const createAppointmentSlot = async (req: Request, res: Response) => {
  try {
    const slots = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    for (const slotData of slots) {
      const { dayOfWeek, startTime, endTime, isAvailable } = slotData;
      if (
        typeof dayOfWeek !== "number" ||
        typeof startTime !== "string" ||
        typeof endTime !== "string" ||
        typeof isAvailable !== "boolean"
      ) {
        return apiError(res, "Invalid slot data", 400);
      }
      const slot = await prisma.appointmentSlot.upsert({
        where: { dayOfWeek_startTime_endTime: { dayOfWeek, startTime, endTime } },
        update: { isAvailable },
        create: { dayOfWeek, startTime, endTime, isAvailable },
      });
      results.push(slot);
    }
    if (results.length === 1) {
      return apiSuccess(res, { slot: results[0] }, "Appointment slot saved");
    } else {
      return apiSuccess(res, { slots: results }, "Appointment slots saved");
    }
  } catch (error) {
    console.error("[createAppointmentSlot]", error);
    return apiError(res, "Failed to create or update slot", 500, error);
  }
};

export const deleteAppointmentSlot = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.query;
    if (!slotId || typeof slotId !== "string") {
      return apiError(res, "Missing or invalid slotId", 400);
    }
    await prisma.appointmentSlot.delete({ where: { id: slotId } });
    return apiSuccess(res, null, "Appointment slot deleted");
  } catch (error) {
    console.error("[deleteAppointmentSlot]", error);
    return apiError(res, "Failed to delete slot", 500, error);
  }
};
