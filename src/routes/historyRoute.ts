import { Router } from "express";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";
import { getDataOfPastMonths, getHistory } from "../controllers/historyController";

const router = Router();

router.get("/get-history", isAuthorized, canAccessDashboard, getHistory);
router.get("/past-months-data", isAuthorized, canAccessDashboard, getDataOfPastMonths);

export const historyRoute = router;