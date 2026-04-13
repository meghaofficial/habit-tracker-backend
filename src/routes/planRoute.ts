import { Router } from "express";
import { createPlan, deletePlan, getAllPlans, getPlan, updatePlan } from "../controllers/planController";

const router = Router();

router.get("/all-plans", getAllPlans);
router.post("/create-plan", createPlan);
router.route("/plan").get(getPlan).delete(deletePlan).patch(updatePlan);

export const planRoute = router;