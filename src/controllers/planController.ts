import { Request, Response } from "express";
import Plan from "../models/plans";

export const getAllPlans = async (req: Request, res: Response) => {
  try {

    const allPlans = await Plan.find();

    return res.status(200).json({
      success: true,
      size: allPlans.length,
      plans: allPlans,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const getPlan = async (req: Request, res: Response) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    const plan = await Plan.findById(id);

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    return res.status(200).json({
      success: true,
      plan,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, duration, active = false } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const normalizedName = name.trim();
    const existingPlan = await Plan.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") }
    });

    if (existingPlan) {
      return res.status(409).json({ success: false, message: "Plan already exists" });
    }

    const newPlan = new Plan({ name: normalizedName, price, duration, active });
    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: "Created successfully",
      newPlan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const deletePlan = async (req: Request, res: Response) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    await Plan.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const updatePlan = async (req: Request, res: Response) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    const updates = req.body;

    const plan = await Plan.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Returns the updated doc & validates input
    );

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    return res.status(200).json({
      success: true,
      updatedPlan: plan,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}