import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDateLog, markTask, addTask, getTask, removeTask, updateTask, getMonthlyNote, updateMonthlyNote, getMonthlyTargets, addMonthlyTargets, updateMonthlyTargets, removeMonthlyTargets, markMonthlyTargets } from "../controllers/dateLogController";

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

export const dateLogRoute = router;