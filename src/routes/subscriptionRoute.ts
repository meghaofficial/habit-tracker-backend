import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import { createSubscription, getActiveSubscription, getAllSubscription, hasUsedFree } from "../controllers/subsController";

const router = Router();

router.post(
  "/subscribe",
  isAuthorized,
  createSubscription
);
router.get("/has-used-free", isAuthorized, hasUsedFree);
router.get("/active-subscription", isAuthorized, getActiveSubscription);
router.get("/all-subscriptions", isAuthorized, getAllSubscription);

export const subsRoute = router;