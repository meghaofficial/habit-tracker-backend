import { Request, Response } from "express";
import Plan from "../models/plans";
import Subscription from "../models/subscription";
import { sendEmail } from "../services/email.service";
import { subsSuccTemplate } from "../emails/successful-subscription.template";
import { freeSubsSuccTemplate } from "../emails/free-successful-subscription.template";

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
    const email = (req as any).user?.email;
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

      await sendEmail({
        to: email,
        subject: "Free Subscription Successfull",
        html: freeSubsSuccTemplate(email, startDate, endDate),
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

      await sendEmail({
        to: email,
        subject: "Subscription Successfull",
        html: subsSuccTemplate(email, startDate, endDate),
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

    const now = new Date();

    // Mark expired active subscriptions
    await Subscription.updateMany(
      {
        userID,
        status: "active",
        endDate: { $lt: now },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    const [activeSubs, freeUsed] = await Promise.all([
      Subscription.findOne({
        userID,
        status: "active",
        endDate: { $gt: now },
      }).populate("planID"),

      Subscription.exists({
        userID,
        planType: "free",
      }),
    ]);

    // Active subscription exists
    if (activeSubs) {
      return res.status(200).json({
        success: true,
        subscription: activeSubs,
        hasUsedFree: !!freeUsed,
      });
    }

    // Activate scheduled subscription whose start date has arrived
    const activatedSub = await Subscription.findOneAndUpdate(
      {
        userID,
        status: "scheduled",
        startDate: { $lte: now },
      },
      {
        $set: {
          status: "active",
        },
      },
      {
        new: true,
      },
    ).populate("planID");

    if (activatedSub) {
      return res.status(200).json({
        success: true,
        subscription: activatedSub,
        hasUsedFree: !!freeUsed,
      });
    }

    return res.status(200).json({
      success: true,
      subscription: null,
      hasUsedFree: !!freeUsed,
      message: "No active subscription",
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
    const { type } = req.query; // active, expired, scheduled
    // const subs = await Subscription.find({
    //   userID,
    // }).select("planType startDate endDate status");

    let subs = [];

    if (!type) {
      const subs = await Subscription.find({
        userID,
      }).select("planType startDate endDate status");
      if (!subs) {
        return res.status(404).json({
          success: false,
          message: "No subscription found",
        });
      }
      else return res.status(200).json({
        success: true,
        subscriptions: subs,
      });
    }

    else {
      const subs = await Subscription.find({
        userID, status: type
      }).select("planType startDate endDate status");
      if (!subs) {
        return res.status(404).json({
          success: false,
          message: "No subscription found",
        });
      }
      else return res.status(200).json({
        success: true,
        subscriptions: subs,
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
