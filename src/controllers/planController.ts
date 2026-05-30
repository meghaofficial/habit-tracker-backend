import { Request, Response } from "express";
import Plan from "../models/plans";

export const getPlans = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const planTypeToFind = type === "paid" ? "paid" : "free";
    const plans = await Plan.find({ planType: planTypeToFind });

    return res.status(200).json({
      success: true,
      plans: plans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { planName, planType, no_of_months, amount } = req.body;

    if (!planName || !planType || !no_of_months) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const normalizedName = planName.trim().toLowerCase();

    const existingPlan = await Plan.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingPlan) {
      return res
        .status(409)
        .json({ success: false, message: "Plan already exists" });
    }

    const newPlan = new Plan({
      planName: normalizedName,
      planType,
      no_of_months,
      amount,
    });
    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: "Created successfully",
      newPlan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.params;

    if (!plan_id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    const plan = await Plan.findByIdAndDelete(plan_id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.params;

    if (!plan_id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    const updates = req.body;

    const plan = await Plan.findByIdAndUpdate(
      plan_id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });

    return res.status(200).json({
      success: true,
      updatedPlan: plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
