import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const token = req.headers.authorization;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token", h: req.headers });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    (req as any).user = user; // optional

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};