import { Router } from "express";
import { addTask, getDashboard, removeTask, updateMonthNote, updateTaskCheckData, updateTaskName } from "../controllers/dashboardController";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized } from "../middlewares/authMiddleware";

const router = Router();

router.get("/dashboard", isAuthorized, canAccessDashboard, getDashboard);

router.post("/add-task", isAuthorized, canAccessDashboard, addTask);
router.delete("/remove-task", isAuthorized, canAccessDashboard, removeTask);

router.put("/update-task-name", isAuthorized, canAccessDashboard, updateTaskName);
router.put("/update-task-check", isAuthorized, canAccessDashboard, updateTaskCheckData);

router.put("/update-month-note", isAuthorized, canAccessDashboard, updateMonthNote);

export const dashboardRoute = router;