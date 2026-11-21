import { Router } from "express";
import {
  getLogByDate,
  getMonthlyActivity,
  getStreakWithMoreData,
  getTodayActivity,
  getTopLevelAnalysis,
  getWeeklyActivity,
} from "./analysis.controller";
import { isAuthorized } from "../../shared/middlewares/auth.middleware";
import { canAccessDashboard } from "../../shared/middlewares/dashboard.middleware";

const router = Router();

router.get(
  "/get-today-activity",
  isAuthorized,
  canAccessDashboard,
  getTodayActivity,
);
router.get(
  "/get-weekly-activity",
  isAuthorized,
  canAccessDashboard,
  getWeeklyActivity,
);
router.get(
  "/get-monthly-activity",
  isAuthorized,
  canAccessDashboard,
  getMonthlyActivity,
);
router.get("/get-log-date", isAuthorized, canAccessDashboard, getLogByDate);
router.get(
  "/get-streak",
  isAuthorized,
  canAccessDashboard,
  getStreakWithMoreData,
);

// New Additions
router.get("/analysis", isAuthorized, canAccessDashboard, getTopLevelAnalysis);

export const analysisRoute = router;
