// src/routes/appointment.routes.ts
import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointment);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
