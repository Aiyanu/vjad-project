// src/routes/bank.routes.ts
import { Router } from "express";
import { getBanks } from "../controllers/bank.controller";

const router = Router();

router.get("/", getBanks);

export default router;
