import { Request, Response } from "express";
import Plan from "../models/plans";
import Subscription from "../models/subscription";
import { getEndOfMonth } from "../helper/utils";

const handlePayment = async (amount: number) => {
  try {

    // code for payment
    const isPaymentDone = true;

    return isPaymentDone ? amount : null;

  } catch (error) {
    console.error(error);
  }
}

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { planID, amount } = req.body;

    const currDate = new Date();

    // 1. Get plan
    const planDetails = await Plan.findById(planID);
    if (!planDetails) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // 2. Check free usage (only matters for free plan)
    const hasFreeSub = await Subscription.exists({
      userID,
      planType: "free",
    });

    if (planDetails.planType === "free" && hasFreeSub) {
      return res.status(409).json({
        success: false,
        message: "You have already used your free trial"
      });
    }

    // 3. Check active subscription or latest subscription scheduled
    const activeSubs = await Subscription.findOne({
      userID,
      status: "active"
    });
    const lastSubscription = await Subscription.findOne({
      userID,
      status: { $in: ["active", "scheduled"] }
    }).sort({ endDate: -1 });

    // 4. Calculate startDate
    let startDate = currDate;

    if (lastSubscription) {
      const currSubsEnd = new Date(lastSubscription.endDate);

      startDate = new Date(currSubsEnd);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);
    }

    // 5. Calculate endDate
    const totalMonths = Number(planDetails.no_of_months);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + totalMonths,
      0
    );

    // 6. Handle FREE plan
    if (planDetails.planType === "free") {
      await Subscription.create({
        userID,
        planID,
        planType: "free",
        startDate,
        endDate,
        status: activeSubs ? "scheduled" : "active",
        paymentStatus: "free"
      });

      return res.status(201).json({
        success: true,
        message: "Free subscription activated"
      });
    }

    // 7. Handle PAID plan
    try {
      await handlePayment(amount);

      await Subscription.create({
        userID,
        planID,
        planType: "paid",
        startDate,
        endDate,
        status: activeSubs ? "scheduled" : "active",
        paymentStatus: "paid"
      });

      return res.status(201).json({
        success: true,
        message: "Subscription Successful"
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Payment failed"
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

export const hasUsedFree = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const hasFreeSub = await Subscription.exists({
      userID,
      planType: "free",
    });

    return res.status(200).json({
      success: true,
      hasUsedFree: !!hasFreeSub
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const getActiveSubscription = async (req: Request, res: Response) => {
  try {

    const userID = (req as any).user?.id;
    const activeSub = await Subscription.findOne({
      userID,
      status: "active"
    }).populate("planType startDate endDate status");

    if (!activeSub) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found"
      });
    }

    return res.status(200).json({
      success: true,
      // subscription: {
      //   planType: activeSub.planType,
      //   startDate: activeSub.startDate,
      //   endDate: activeSub.endDate,
      //   status: activeSub.status
      // },
      subscription: activeSub
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const getAllSubscription = async (req: Request, res: Response) => {
  try {

    const userID = (req as any).user?.id;
    const subs = await Subscription.find({
      userID,
    }).populate("planType startDate endDate status");

    if (!subs) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    return res.status(200).json({
      success: true,
      subscriptions: subs
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}