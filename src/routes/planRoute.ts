import { Router } from "express";
import { createPlan, deletePlan, getPlans, updatePlan } from "../controllers/planController";
import { isAdmin, isAuthorized } from "../middlewares/authMiddleware";

const router = Router();

router.get("/get-plans", getPlans);
router.post("/plan", isAuthorized, isAdmin, createPlan);
router.route("/plan/:plan_id")
  .delete(isAuthorized, isAdmin, deletePlan)
  .patch(isAuthorized, isAdmin, updatePlan);

export const planRoute = router;