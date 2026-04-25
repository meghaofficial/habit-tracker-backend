import { Router } from "express";
import { addTask, getDashboard, getData, removeTask, updateTaskCheckData, updateTaskName } from "../controllers/dashboardController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";

const router = Router();

router.post("/dashboard", authMiddleware, canAccessDashboard, getDashboard);

router.post("/add-task", authMiddleware, canAccessDashboard, addTask);
router.delete("/remove-task", authMiddleware, canAccessDashboard, removeTask);

router.put("/update-task-name", authMiddleware, canAccessDashboard, updateTaskName);
router.put("/update-task-check", authMiddleware, canAccessDashboard, updateTaskCheckData);

router.get("/get-dashboard", authMiddleware, canAccessDashboard, getData);

export const dashboardRoute = router;