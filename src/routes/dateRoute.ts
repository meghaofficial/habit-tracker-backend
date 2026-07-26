import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDateLog, markTask, addTask, getTask, removeTask, updateTask, getMonthlyNote, updateMonthlyNote, getMonthlyTargets, addMonthlyTargets, updateMonthlyTargets, removeMonthlyTargets, markMonthlyTargets, getWeeklyTargets, addWeeklyTargets, updateWeeklyTargets, removeWeeklyTargets, markWeeklyTargets, resetDatelog } from "../controllers/dateLog.controller";

const router = Router();

router.route("/date-logs")
  .get(isAuthorized, canAccessDashboard, getDateLog)
  .patch(isAuthorized, canAccessDashboard, markTask);

router.route("/task")
  .get(isAuthorized, canAccessDashboard, getTask)
  .post(isAuthorized, canAccessDashboard, addTask)
  .delete(isAuthorized, canAccessDashboard, removeTask)
  .patch(isAuthorized, canAccessDashboard, updateTask);

router.route("/monthly-note")
  .get(isAuthorized, canAccessDashboard, getMonthlyNote)
  .put(isAuthorized, canAccessDashboard, updateMonthlyNote);

router.get("/monthly-targets", isAuthorized, canAccessDashboard, getMonthlyTargets);
router.patch("/add-monthly-target", isAuthorized, canAccessDashboard, addMonthlyTargets);
router.patch("/remove-monthly-target", isAuthorized, canAccessDashboard, removeMonthlyTargets);
router.patch("/update-monthly-target", isAuthorized, canAccessDashboard, updateMonthlyTargets);
router.patch("/mark-monthly-target", isAuthorized, canAccessDashboard, markMonthlyTargets);

router.get("/weekly-targets", isAuthorized, canAccessDashboard, getWeeklyTargets);
router.patch("/add-weekly-target", isAuthorized, canAccessDashboard, addWeeklyTargets);
router.patch("/remove-weekly-target", isAuthorized, canAccessDashboard, removeWeeklyTargets);
router.patch("/update-weekly-target", isAuthorized, canAccessDashboard, updateWeeklyTargets);
router.patch("/mark-weekly-target", isAuthorized, canAccessDashboard, markWeeklyTargets);

router.patch("/reset-date-log", isAuthorized, canAccessDashboard, resetDatelog);

export const dateLogRoute = router;