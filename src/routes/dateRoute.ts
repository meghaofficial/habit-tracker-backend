import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDateLog, markTask, addTask, getTask, removeTask, updateTask } from "../controllers/dateLogController";

const router = Router();

router.route("/date-logs")
  .get(isAuthorized, canAccessDashboard, getDateLog)
  .patch(isAuthorized, canAccessDashboard, markTask);

router.route("/task")
  .get(isAuthorized, canAccessDashboard, getTask)
  .post(isAuthorized, canAccessDashboard, addTask)
  .delete(isAuthorized, canAccessDashboard, removeTask)
  .patch(isAuthorized, canAccessDashboard, updateTask)

export const dateLogRoute = router;