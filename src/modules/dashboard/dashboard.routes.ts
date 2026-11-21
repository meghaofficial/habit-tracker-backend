import { Router } from "express";
import { isAuthorized } from "../../shared/middlewares/auth.middleware";
import { canAccessDashboard } from "../../shared/middlewares/dashboard.middleware";
import { getDashboard } from "./dashboard.controller";

const router = Router();

router.get("/dashboard", isAuthorized, canAccessDashboard, getDashboard);

export const dashboardRoute = router;
