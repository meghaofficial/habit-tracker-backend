import { Router } from "express";
import {
  sendTestNotification,
  subscribeToNotifications,
} from "../controllers/notification.controller";
import { isAuthorized } from "../middlewares/authMiddleware";

const router = Router();

router.post("/notifications/subscribe", isAuthorized, subscribeToNotifications);
router.post("/notifications/test", isAuthorized, sendTestNotification);

export const notificationRoute = router;
