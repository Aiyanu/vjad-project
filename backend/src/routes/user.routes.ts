import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, userController.getProfile);
router.put("/update-profile", authenticateToken, userController.updateProfile);
router.post("/update-profile", authenticateToken, userController.updateProfile);

export default router;
