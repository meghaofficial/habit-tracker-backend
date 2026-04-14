import { Router } from "express";
import { createPlan, deletePlan, getAllPlans, getPlan, updatePlan } from "../controllers/planController";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/all-plans", getAllPlans);
router.post("/create-plan", authMiddleware, isAdmin, createPlan);
router.route("/plan")
  .get(authMiddleware, isAdmin, getPlan)
  .delete(authMiddleware, isAdmin, deletePlan)
  .patch(authMiddleware, isAdmin, updatePlan);

export const planRoute = router;