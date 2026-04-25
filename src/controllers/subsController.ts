import { Request, Response } from "express";
import Plan from "../models/plans";
import Subscription from "../models/subscription";

// export const getDashboard = async (req: Request, res: Response) => {
//   try {

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong"
//     })
//   }
// }

// export const subscribe = async (req: Request, res: Response) => {
//   try {

//     const userId = (req as any).user?.id;

//     if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

//     // userId: mongoose.Types.ObjectId;
//     // planId: mongoose.Types.ObjectId;
//     // status: "active" | "cancelled" | "expired" | "pending";
//     // startDate: Date;
//     // endDate: Date;
//     // autoRenew: boolean;
//     // paymentId?: string;

//     const { planId } = req.body;
//     const planDetails = await Plan.findOne(planId);

//     if (!planDetails) return res.status(404).json({ success: false, message: "Invalid Plan" });

//     const { name, price, duration, active } = planDetails;

//     if (!active) return res.status(404).json({ success: false, message: "Plan is not activated" });



//     const userExistingSubscriptions = await Subscription.find({ userId });

//     if (userExistingSubscriptions.length > 0){
//       // One time one active
//       const activeS = userExistingSubscriptions.find(s => s.status === "active");
//       const endDate = activeS;
//     }
//     else {

//       const date = new Date();
//       const d = date.getDate();
//       const m = date.getMonth();
//       const y = date.getFullYear();

//       const startDate = Date.now();
//       const endDate = duration-1 + 

//     }


//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// }

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { planId } = req.body;
    const planDetails = await Plan.findById(planId);

    if (!planDetails) {
      return res.status(404).json({ success: false, message: "Invalid Plan" });
    }
    if (!planDetails.active) {
      return res.status(400).json({ success: false, message: "Plan not active" });
    }

    const { duration } = planDetails;

    const activeSub = await Subscription.findOne({
      userId,
      status: "active",
    });

    let startDate: Date;
    let endDate: Date;
    let status: "active" | "pending";

    if (!activeSub) {
      startDate = new Date();

      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duration);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

      status = "active";
    } else {
      startDate = new Date(
        activeSub.endDate.getFullYear(),
        activeSub.endDate.getMonth() + 1,
        1
      );

      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duration);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

      status = "pending";
    }

    const newSubscription = await Subscription.create({
      userId,
      planId,
      status,
      startDate,
      endDate,
      autoRenew: true,
    });

    return res.status(201).json({
      success: true,
      message:
        status === "active"
          ? "Subscription activated"
          : "Subscription scheduled",
      data: newSubscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const extendPlan = async (req: Request, res: Response) => { }

export const getSubsDetails = async (req: Request, res: Response) => { }

export const getSubsHistory = async (req: Request, res: Response) => { }
