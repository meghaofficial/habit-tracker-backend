import { Router } from "express";
import { isAuthorized } from "../../shared/middlewares/auth.middleware";
import { canAccessDashboard } from "../../shared/middlewares/dashboard.middleware";
import { getDataOfPastMonths } from "./history.controller";

const router = Router();

router.get(
  "/past-months-data",
  isAuthorized,
  canAccessDashboard,
  getDataOfPastMonths,
);

export const historyRoute = router;
