import { Request, Response } from "express";
import Roadmap from "./roadmap.model";
import mongoose from "mongoose";

export const createRoadmap = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      build = "manual",
      name,
      description = "",
      icon = "",
      category = "",
      expected_completion_time,
    } = req.body;

    // Validate name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roadmap name is required",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Roadmap name cannot exceed 50 characters",
      });
    }

    // Validate description
    if (typeof description !== "string" || description.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 150 characters",
      });
    }

    // Validate build
    if (!["manual", "ai"].includes(build)) {
      return res.status(400).json({
        success: false,
        message: "Invalid build type. Allowed values: manual, ai",
      });
    }

    // Validate expected completion time
    let completionTime = null;

    if (expected_completion_time) {
      const { value, unit } = expected_completion_time;

      if (
        typeof value !== "number" ||
        value < 0 ||
        !["days", "weeks", "months", "years"].includes(unit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid expected completion time",
        });
      }

      completionTime = { value, unit };
    }

    const roadmap = await Roadmap.create({
      userID,
      build,
      name: name.trim(),
      description: description.trim(),
      icon,
      category,
      expected_completion_time: completionTime,
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap created successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Create roadmap error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
