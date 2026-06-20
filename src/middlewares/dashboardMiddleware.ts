import { NextFunction, Request, Response } from "express";
import Subscription from "../models/subscription";

export const canAccessDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userID = (req as any).user?.id;

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const now = new Date();

  const validSubscription = await Subscription.findOne({
    userID,
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).select("_id startDate endDate status");

  if (!validSubscription) {
    return res.status(403).json({
      success: false,
      message: "No active subscription found",
    });
  }

  (req as any).user = { id: userID };
  (req as any).subscription = validSubscription;

  next();
};
