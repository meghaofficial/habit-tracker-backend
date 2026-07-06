import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { createCalandarData, getCalandarData, updateCalandarData } from "../controllers/calandarController";

const router = Router();

router.route("/calandar")
  .post(isAuthorized, canAccessDashboard, createCalandarData)
  .get(isAuthorized, canAccessDashboard, getCalandarData)
  .patch(isAuthorized, canAccessDashboard, updateCalandarData)

export const calandarRoute = router;