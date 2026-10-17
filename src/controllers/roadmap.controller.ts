import { Request, Response } from "express";
import RoadmapItem from "../models/roadmaps.model";

export const getRoadmapList = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const search = (req.query.search as string)?.trim() || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );

    const skip = (page - 1) * limit;
    const filter: any = { userID };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [roadmaps, total] = await Promise.all([
      RoadmapItem.find(filter).select("-userID").skip(skip).limit(limit).lean(),

      RoadmapItem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Roadmaps fetched successfully",
      data: roadmaps,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1 && total > 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createRoadmapItem = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      title,
      description,
      icon,
      total_nodes_count,
      completed_nodes_count,
      status,
      accent_color,
      category,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roadmap title is required",
      });
    }

    const roadmapItem = await RoadmapItem.create({
      userID,
      title: title.trim(),
      description,
      icon,
      total_nodes_count: total_nodes_count ?? 0,
      completed_nodes_count: completed_nodes_count ?? 0,
      status: status ?? "pending",
      accent_color,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap created successfully",
      data: roadmapItem,
    });
  } catch (error) {
    console.error("Create roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateRoadmapItem = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteRoadmapItem = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { id } = req.params;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deletedRoadmap = await RoadmapItem.findOneAndDelete({
      _id: id,
      userID,
    });

    if (!deletedRoadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roadmap deleted successfully",
    });
  } catch (error) {
    console.error("Delete roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
