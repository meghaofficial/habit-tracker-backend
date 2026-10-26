import { Request, Response } from "express";
import RoadmapItem from "../models/roadmaps.model";
import mongoose from "mongoose";

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
    const completed = req.query.completed === "true";

    const skip = (page - 1) * limit;
    const filter: any = { userID, parent_id: null };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (completed) {
      filter.total_nodes_count = { $gt: 0 };
      filter.$expr = { $eq: ["$total_nodes_count", "$completed_nodes_count"] };
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
  const session = await mongoose.startSession();

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
      parent_id,
      type,
      points,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roadmap title is required",
      });
    }

    const itemType = type ?? "roadmap";

    if (!["roadmap", "list"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'roadmap' or 'list'",
      });
    }

    if (parent_id && !mongoose.Types.ObjectId.isValid(parent_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent_id",
      });
    }

    // Validate list points
    let validatedPoints: {
      id: string;
      text: string;
      order: number;
      completed: boolean;
    }[] = [];

    if (itemType === "list") {
      if (points !== undefined && !Array.isArray(points)) {
        return res.status(400).json({
          success: false,
          message: "Points must be an array",
        });
      }

      validatedPoints = (points ?? []).map((point: any, index: number) => ({
        id: point.id || new mongoose.Types.ObjectId().toString(),
        text: typeof point.text === "string" ? point.text.trim() : "",
        order: index,
        completed: false,
      }));

      if (
        validatedPoints.some(
          (point) => !point.text || typeof point.id !== "string",
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Every list point must have non-empty text",
        });
      }
    }

    let responseData: {
      data: any;
      parents: { _id: mongoose.Types.ObjectId; title: string }[];
    } | null = null;

    await session.withTransaction(async () => {
      let parent = null;

      const parents: {
        _id: mongoose.Types.ObjectId;
        title: string;
      }[] = [];

      // Find parent and ancestor chain
      if (parent_id) {
        parent = await RoadmapItem.findOne({
          _id: parent_id,
          userID,
        }).session(session);

        if (!parent) {
          throw new Error("PARENT_NOT_FOUND");
        }

        const visited = new Set<string>();
        let currentParent = parent;

        while (currentParent) {
          const currentID = currentParent._id.toString();

          if (visited.has(currentID)) {
            throw new Error("PARENT_CYCLE_DETECTED");
          }

          visited.add(currentID);

          parents.push({
            _id: new mongoose.Types.ObjectId(currentID),
            title: currentParent.title,
          });

          if (!currentParent.parent_id) break;

          const nextParent = await RoadmapItem.findOne({
            _id: currentParent.parent_id,
            userID,
          }).session(session);

          if (!nextParent) {
            throw new Error("INVALID_PARENT_CHAIN");
          }

          currentParent = nextParent;
        }

        parents.reverse();
      }

      // Create roadmap item
      const [roadmapItem] = await RoadmapItem.create(
        [
          {
            userID,
            title: title.trim(),
            description: description ?? "",
            icon: icon ?? "",
            total_nodes_count: total_nodes_count ?? 0,
            completed_nodes_count: completed_nodes_count ?? 0,
            status: status ?? "pending",
            accent_color: accent_color ?? "",
            category: category ?? "",
            type: itemType,
            points: itemType === "list" ? validatedPoints : [],
            parent_id: parent?._id ?? null,
            nodes: [],
          },
        ],
        { session },
      );

      // Add child ID to parent
      if (parent) {
        await RoadmapItem.updateOne(
          {
            _id: parent._id,
            userID,
          },
          {
            $addToSet: {
              nodes: roadmapItem._id,
            },
          },
          { session },
        );
      }

      responseData = {
        data: roadmapItem.toObject(),
        parents,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap item created successfully",
      data: responseData,
    });
  } catch (error: any) {
    console.error("Create roadmap error:", error);

    if (error.message === "PARENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Parent roadmap item not found",
      });
    }

    if (error.message === "INVALID_PARENT_CHAIN") {
      return res.status(400).json({
        success: false,
        message: "The parent roadmap chain is invalid",
      });
    }

    if (error.message === "PARENT_CYCLE_DETECTED") {
      return res.status(400).json({
        success: false,
        message: "A cycle was detected in the parent chain",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    await session.endSession();
  }
};

export const getRoadmapByID = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { id } = req.params;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID",
      });
    }

    const roadmap = await RoadmapItem.findOne({
      _id: id,
      userID,
    }).populate({
      path: "nodes",
      match: { userID },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roadmap fetched successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const categories = await RoadmapItem.distinct("category", {
      userID,
      category: { $nin: ["", null] },
      parent_id: null,
    });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFullRoadmapByID = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { id } = req.params;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID",
      });
    }

    const root = await RoadmapItem.findOne({
      _id: id,
      userID,
    }).lean();

    if (!root) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const populateChildren = async (node: any): Promise<any> => {
      if (!node.nodes?.length) {
        return {
          ...node,
          nodes: [],
        };
      }

      const children = await RoadmapItem.find({
        _id: { $in: node.nodes },
        userID,
      }).lean();

      // Preserve the original order of child IDs.
      const childrenById = new Map(
        children.map((child) => [child._id.toString(), child]),
      );

      const orderedChildren = node.nodes
        .map((childId: mongoose.Types.ObjectId) =>
          childrenById.get(childId.toString()),
        )
        .filter(Boolean);

      return {
        ...node,
        nodes: await Promise.all(
          orderedChildren.map((child: any) => populateChildren(child)),
        ),
      };
    };

    const fullRoadmap = await populateChildren(root);

    return res.status(200).json({
      success: true,
      roadmap: fullRoadmap,
    });
  } catch (error) {
    console.error("Error fetching full roadmap:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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

    // Verify that the root item belongs to this user
    const roadmap = await RoadmapItem.findOne({
      _id: id,
      userID,
    }).select("_id");

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    // Collect the root ID and every descendant ID
    const allIds: string[] = [roadmap._id.toString()];
    let currentParentIds: string[] = [roadmap._id.toString()];

    while (currentParentIds.length > 0) {
      const children = await RoadmapItem.find({
        parent_id: { $in: currentParentIds },
        userID,
      }).select("_id");

      const childIds = children.map((child) => child._id.toString());

      if (childIds.length === 0) break;

      allIds.push(...childIds);
      currentParentIds = childIds;
    }

    // Delete the root and all descendants
    await RoadmapItem.deleteMany({
      _id: { $in: allIds },
      userID,
    });

    return res.status(200).json({
      success: true,
      message: "Roadmap and all nested items deleted successfully",
      deletedCount: allIds.length,
    });
  } catch (error) {
    console.error("Delete roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getRoadmapTrail = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { ids } = req.body;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
      return res.status(400).json({
        success: false,
        message: "ids must be an array of strings",
      });
    }

    if (ids.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    if (!ids.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "One or more roadmap IDs are invalid",
      });
    }

    // Fetch all requested roadmaps in one database query.
    const roadmaps = await RoadmapItem.find({
      _id: { $in: ids },
      userID,
    })
      .select("_id title accent_color")
      .lean();

    // Create a lookup map for preserving the requested order.
    const roadmapMap = new Map(
      roadmaps.map((roadmap) => [roadmap._id.toString(), roadmap]),
    );

    // Ensure every requested ID belongs to the authenticated user.
    const missingRoadmap = ids.some((id) => !roadmapMap.has(id));

    if (missingRoadmap) {
      return res.status(404).json({
        success: false,
        message: "One or more roadmaps were not found",
      });
    }

    // Return roadmaps in the same order as the supplied IDs.
    const data = ids.map((id) => {
      const roadmap = roadmapMap.get(id)!;

      return {
        _id: roadmap._id,
        title: roadmap.title,
        accent_color: roadmap.accent_color,
      };
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch roadmap trail:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roadmap trail",
    });
  }
};

export const startRoadmap = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { parentID, childID } = req.body;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!parentID || !childID) {
      return res.status(400).json({
        success: false,
        message: "parentID and childID are required",
      });
    }

    if (
      !mongoose.isValidObjectId(parentID) ||
      !mongoose.isValidObjectId(childID)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap IDs",
      });
    }

    if (parentID === childID) {
      return res.status(400).json({
        success: false,
        message: "Parent and child IDs must be different",
      });
    }

    // Verify that both nodes belong to the user and that
    // the child is actually a direct child of the parent.
    const [parent, child] = await Promise.all([
      RoadmapItem.findOne({ _id: parentID, userID }).select("_id"),
      RoadmapItem.findOne({
        _id: childID,
        userID,
        parent_id: parentID,
      }).select("_id"),
    ]);

    if (!parent || !child) {
      return res.status(404).json({
        success: false,
        message: "Parent or child roadmap not found",
      });
    }

    // Update both nodes in one database operation.
    const result = await RoadmapItem.updateMany(
      {
        _id: { $in: [parentID, childID] },
        userID,
        status: "pending",
      },
      {
        $set: { status: "in-progress" },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Roadmap started successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Failed to start roadmap:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start roadmap",
    });
  }
};
