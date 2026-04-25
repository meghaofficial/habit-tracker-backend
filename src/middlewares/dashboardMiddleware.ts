import { NextFunction, Request, Response } from "express";
import User from "../models/authModel";
import { hasAccess } from "../access.service";

export const canAccessDashboard = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const access = await hasAccess(user);

  if (!access) {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  next();
};