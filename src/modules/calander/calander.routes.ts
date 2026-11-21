import { Router } from "express";
import {
  createCalandarData,
  getCalandarData,
  updateCalandarData,
  deleteCalandarData,
} from "./calander.controller";
import { isAuthorized } from "../../shared/middlewares/auth.middleware";
import { canAccessDashboard } from "../../shared/middlewares/dashboard.middleware";

const router = Router();

router
  .route("/calandar")
  .post(isAuthorized, canAccessDashboard, createCalandarData)
  .get(isAuthorized, canAccessDashboard, getCalandarData)
  .patch(isAuthorized, canAccessDashboard, updateCalandarData)
  .delete(isAuthorized, canAccessDashboard, deleteCalandarData);

export const calandarRoute = router;
