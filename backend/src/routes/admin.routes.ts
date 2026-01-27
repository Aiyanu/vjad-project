import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/affiliates", adminController.getAffiliates);
router.patch("/users/:id/status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

router.get("/admins", adminController.getAdmins);
router.post("/admins", adminController.createAdmin);

export default router;
