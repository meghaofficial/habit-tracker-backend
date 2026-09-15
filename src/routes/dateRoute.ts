import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import {
  getDateLog,
  markTask,
  addTask,
  getTask,
  removeTask,
  updateTask,
  getMonthlyNote,
  updateMonthlyNote,
  getMonthlyTargets,
  addMonthlyTargets,
  updateMonthlyTargets,
  removeMonthlyTargets,
  markMonthlyTargets,
  getWeeklyTargets,
  addWeeklyTargets,
  updateWeeklyTargets,
  removeWeeklyTargets,
  markWeeklyTargets,
  resetDatelog,
  checkForLastMonth,
  updateTaskList,
  getLastMonthTasks,
  getDailyTargets,
  addDailyTargets,
  removeDailyTargets,
  updateDailyTargets,
  markDailyTargets,
  getAllTargetsCount,
} from "../controllers/dateLog.controller";

const router = Router();

router
  .route("/date-logs")
  .get(isAuthorized, canAccessDashboard, getDateLog)
  .patch(isAuthorized, canAccessDashboard, markTask);

router
  .route("/task")
  .get(isAuthorized, canAccessDashboard, getTask)
  .post(isAuthorized, canAccessDashboard, addTask)
  .delete(isAuthorized, canAccessDashboard, removeTask)
  .patch(isAuthorized, canAccessDashboard, updateTask);

router
  .route("/monthly-note")
  .get(isAuthorized, canAccessDashboard, getMonthlyNote)
  .put(isAuthorized, canAccessDashboard, updateMonthlyNote);

router
  .route("/monthly-targets")
  .get(isAuthorized, canAccessDashboard, getMonthlyTargets)
  .post(isAuthorized, canAccessDashboard, addMonthlyTargets)
  .delete(isAuthorized, canAccessDashboard, removeMonthlyTargets)
  .put(isAuthorized, canAccessDashboard, updateMonthlyTargets)
  .patch(isAuthorized, canAccessDashboard, markMonthlyTargets);

router
  .route("/weekly-targets")
  .get(isAuthorized, canAccessDashboard, getWeeklyTargets)
  .post(isAuthorized, canAccessDashboard, addWeeklyTargets)
  .delete(isAuthorized, canAccessDashboard, removeWeeklyTargets)
  .put(isAuthorized, canAccessDashboard, updateWeeklyTargets)
  .patch(isAuthorized, canAccessDashboard, markWeeklyTargets);

router.patch("/reset-date-log", isAuthorized, canAccessDashboard, resetDatelog);

// New routes
router.get("/last-month", isAuthorized, canAccessDashboard, checkForLastMonth);
router
  .route("/task-list")
  .get(isAuthorized, canAccessDashboard, getLastMonthTasks)
  .put(isAuthorized, canAccessDashboard, updateTaskList);

router
  .route("/daily-targets")
  .get(isAuthorized, canAccessDashboard, getDailyTargets)
  .post(isAuthorized, canAccessDashboard, addDailyTargets)
  .delete(isAuthorized, canAccessDashboard, removeDailyTargets)
  .put(isAuthorized, canAccessDashboard, updateDailyTargets)
  .patch(isAuthorized, canAccessDashboard, markDailyTargets);

router.get(
  "/targets-summary",
  isAuthorized,
  canAccessDashboard,
  getAllTargetsCount,
);

export const dateLogRoute = router;
