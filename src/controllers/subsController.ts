import { Request, Response } from "express";
import Plan from "../models/plans";

export const subscribe = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // userId: mongoose.Types.ObjectId;
    // planId: mongoose.Types.ObjectId;
    // status: "active" | "cancelled" | "expired" | "pending";
    // startDate: Date;
    // endDate: Date;
    // autoRenew: boolean;
    // paymentId?: string;

    const { planId } = req.body;
    const planDetails = await Plan.findOne(planId);

    if (!planDetails) return res.status(404).json({ success: false, message: "Invalid Plan" });

    const { duration, active } = planDetails;

    // if ()

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

export const extendPlan = async (req: Request, res: Response) => { }

export const getSubsDetails = async (req: Request, res: Response) => { }

export const getSubsHistory = async (req: Request, res: Response) => { }