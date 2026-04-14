import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { subscribe } from "../controllers/subsController";

const router = Router();

router.post("/subscribe", authMiddleware, subscribe);

export const subsRoute = router;