import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { getMonthlyActivity, getTodayActivity, getWeeklyActivity } from "../controllers/analysisController";

const router = Router();

router.get("/get-today-activity", isAuthorized, canAccessDashboard, getTodayActivity);
router.get("/get-weekly-activity", isAuthorized, canAccessDashboard, getWeeklyActivity);
router.get("/get-monthly-activity", isAuthorized, canAccessDashboard, getMonthlyActivity);

export const analysisRoute = router;