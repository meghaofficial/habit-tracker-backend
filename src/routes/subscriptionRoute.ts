import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { createSubscription } from "../controllers/subsController";

const router = Router();

router.post(
  "/subscribe",
  isAuthorized,
  canAccessDashboard,
  createSubscription
);

export const subsRoute = router;