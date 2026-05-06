import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDashboard } from "../controllers/dashboardController";

const router = Router();

router.get("/dashboard", isAuthorized, canAccessDashboard, getDashboard);

export const dashboardRoute = router;