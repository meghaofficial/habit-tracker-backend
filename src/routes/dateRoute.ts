import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDateLog, markTask, addTask, getTask } from "../controllers/dateLogController";

const router = Router();

router.route("/date-logs")
  .get(isAuthorized, canAccessDashboard, getDateLog)
  .patch(isAuthorized, canAccessDashboard, markTask);

router.post("/add-task", isAuthorized, canAccessDashboard, addTask)

router.get("/get-task", isAuthorized, canAccessDashboard, getTask)

export const dateLogRoute = router;