import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { createSubscription, getActiveSubscription, hasUsedFree } from "../controllers/subsController";

const router = Router();

router.post(
  "/subscribe",
  isAuthorized,
  createSubscription
);
router.get("/has-used-free", isAuthorized, hasUsedFree);
router.get("/active-subscription", isAuthorized, getActiveSubscription);

export const subsRoute = router;