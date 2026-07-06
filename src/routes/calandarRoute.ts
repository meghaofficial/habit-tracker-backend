import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { createCalandarData, getCalandarData, updateCalandarData, deleteCalandarData } from "../controllers/calandarController";

const router = Router();

router.route("/calandar")
  .post(isAuthorized, canAccessDashboard, createCalandarData)
  .get(isAuthorized, canAccessDashboard, getCalandarData)
  .patch(isAuthorized, canAccessDashboard, updateCalandarData)
  .delete(isAuthorized, canAccessDashboard, deleteCalandarData);

export const calandarRoute = router;