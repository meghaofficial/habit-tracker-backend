import { NextFunction, Request, Response } from "express";

export const isfreeTrialExpired = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const user = (req as any).user.id;

    if (!user) return res.status(404).json({ success: false, message: "Not Authorized" });

    const currDate = new Date();
    const ends = user.trialEndDate < currDate;

    if (ends) {
      return res.status(410).json({ success: false, message: "Trial Expired" })
    }

    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Something went wrong" });
  }
}