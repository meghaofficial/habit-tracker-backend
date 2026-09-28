import { Router } from "express";
import { generatePlan } from "../controllers/ai.controller";

const router = Router();

router.post("/generate-plan", generatePlan);

export const aiRoute = router;
