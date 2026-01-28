// src/routes/appointment.routes.ts
import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentSlots,
  createAppointmentSlot,
  deleteAppointmentSlot,
} from "../controllers/appointment.controller";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

// AppointmentSlot routes
router.get("/slots", getAppointmentSlots);
router.post("/slots", createAppointmentSlot);
// router.put("/slots", updateAppointmentSlot);
router.delete("/slots", deleteAppointmentSlot);

export default router;
