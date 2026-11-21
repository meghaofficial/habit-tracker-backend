import { Router } from "express";
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from "./plan.controller";
import {
  isAdmin,
  isAuthorized,
} from "../../shared/middlewares/auth.middleware";

const router = Router();

router.get("/get-plans", getPlans);
router.post("/plan", isAuthorized, isAdmin, createPlan);
router
  .route("/plan/:plan_id")
  .delete(isAuthorized, isAdmin, deletePlan)
  .patch(isAuthorized, isAdmin, updatePlan);

export const planRoute = router;
