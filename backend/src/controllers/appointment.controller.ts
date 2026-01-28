// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import { prisma } from "../lib/db";

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany();
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const appointment = await prisma.appointment.create({ data });
    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
    });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
};
