import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { getTodayActivity } from "../controllers/analysisController";

const router = Router();

router.get("/get-today-activity", isAuthorized, canAccessDashboard, getTodayActivity)

export const analysisRoute = router;