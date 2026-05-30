import { Request, Response } from "express";
import Plan from "../models/plans";
import Subscription from "../models/subscription";

const handlePayment = async (amount: number) => {
  try {
    // code for payment
    const isPaymentDone = true;

    return isPaymentDone ? amount : null;
  } catch (error) {
    console.error(error);
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { planID, amount } = req.body;

    const currDate = new Date();

    const [planDetails, subscriptions] = await Promise.all([
      Plan.findById(planID).lean(),
      Subscription.find({ userID }).sort({ endDate: -1 }).lean(),
    ]);
    if (!planDetails) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const hasFreeSub = subscriptions.some((sub) => sub.planType === "free");

    if (planDetails.planType === "free" && hasFreeSub) {
      return res.status(409).json({
        success: false,
        message: "You have already used your free trial",
      });
    }

    const activeSubs = subscriptions.find((sub) => sub.status === "active");

    const lastSubscription = subscriptions.find((sub) =>
      ["active", "scheduled", "expired"].includes(sub.status),
    );

    let startDate = currDate;

    if (lastSubscription && lastSubscription.status !== "expired") {
      const currSubsEnd = new Date(lastSubscription.endDate);
      startDate = new Date(currSubsEnd);
      startDate.setDate(startDate.getUTCDate() + 1);
      startDate.setUTCHours(0, 0, 0, 0);
    }

    const totalMonths = Number(planDetails.no_of_months);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + totalMonths,
      0,
      23,
      59,
      59,
      999,
    );

    if (planDetails.planType === "free") {
      await Subscription.create({
        userID,
        planID,
        planType: "free",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate,
        endDate,
        status: activeSubs ? "scheduled" : "active",
        paymentStatus: "free",
      });
      return res.status(201).json({
        success: true,
        message: "Free subscription activated",
      });
    }

    try {
      await handlePayment(amount);
      await Subscription.create({
        userID,
        planID,
        planType: "paid",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate,
        endDate,
        status: activeSubs ? "scheduled" : "active",
        paymentStatus: "paid",
      });

      return res.status(201).json({
        success: true,
        message: "Subscription Successful",
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getActiveSubscription = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const subscription = await Subscription.findOne({
      userID,
    }).sort({ endDate: -1 });

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllSubscription = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const subs = await Subscription.find({
      userID,
    }).populate("planType startDate endDate status");

    if (!subs) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      subscriptions: subs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
