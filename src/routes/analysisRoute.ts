import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { getLogByDate, getMonthlyActivity, getStreakWithMoreData, getTodayActivity, getWeeklyActivity } from "../controllers/analysisController";

const router = Router();

router.get("/get-today-activity", isAuthorized, canAccessDashboard, getTodayActivity);
router.get("/get-weekly-activity", isAuthorized, canAccessDashboard, getWeeklyActivity);
router.get("/get-monthly-activity", isAuthorized, canAccessDashboard, getMonthlyActivity);
router.get("/get-log-date", isAuthorized, canAccessDashboard, getLogByDate);
router.get("/get-streak", isAuthorized, canAccessDashboard, getStreakWithMoreData);

export const analysisRoute = router;