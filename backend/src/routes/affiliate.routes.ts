import { Router } from "express";
import * as affiliateController from "../controllers/affiliate.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);

router.get("/referrals", affiliateController.getReferrals);
router.get("/referrals/count", affiliateController.getReferralCount);
router.get("/transactions", affiliateController.getTransactions);

export default router;
