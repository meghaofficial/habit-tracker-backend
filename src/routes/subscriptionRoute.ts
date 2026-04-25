import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { subscribe } from "../controllers/subsController";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";

const router = Router();

// router.post("/subscribe", authMiddleware, canAccessDashboard, subscribe);

export const subsRoute = router;