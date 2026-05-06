import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDateLog, markTask } from "../controllers/dateLogController";

const router = Router();

router.route("/date-logs")
  .get(isAuthorized, canAccessDashboard, getDateLog)
  .patch(isAuthorized, canAccessDashboard, markTask);

export const dateLogRoute = router;