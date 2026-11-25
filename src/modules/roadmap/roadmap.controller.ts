import { Request, Response } from "express";
import Roadmap from "./roadmap.model";
import mongoose from "mongoose";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/s3";
import { uploadToS3 } from "../../shared/utils/uploadToS3.utils";

// export const createRoadmap = async (req: Request, res: Response) => {
//   try {
//     const userID = (req as any).user?.id;

//     if (!userID) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const {
//       build = "manual",
//       name,
//       description = "",
//       icon = { value: "", icon_type: "icon" },
//       category = "",
//       expected_completion_time,
//     } = req.body;

//     // Validate name
//     if (typeof name !== "string" || !name.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Roadmap name is required",
//       });
//     }

//     if (name.trim().length > 50) {
//       return res.status(400).json({
//         success: false,
//         message: "Roadmap name cannot exceed 50 characters",
//       });
//     }

//     // Validate description
//     if (typeof description !== "string" || description.length > 150) {
//       return res.status(400).json({
//         success: false,
//         message: "Description cannot exceed 150 characters",
//       });
//     }

//     // Validate build
//     if (!["manual", "ai"].includes(build)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid build type. Allowed values: manual, ai",
//       });
//     }

//     // Validate icon
//     if (
//       !icon ||
//       typeof icon !== "object" ||
//       Array.isArray(icon) ||
//       typeof icon.value !== "string" ||
//       !["url", "upload", "icon"].includes(icon.icon_type)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid icon. Provide a valid value and icon_type.",
//       });
//     }

//     // Validate category
//     if (typeof category !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid category",
//       });
//     }

//     // Validate expected completion time
//     let completionTime = {};

//     if (expected_completion_time != null) {
//       const { value, unit } = expected_completion_time;

//       if (
//         typeof value !== "number" ||
//         !Number.isFinite(value) ||
//         value < 0 ||
//         !["days", "weeks", "months", "years"].includes(unit)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid expected completion time",
//         });
//       }

//       completionTime = { value, unit };
//     }

//     const roadmap = await Roadmap.create({
//       userID,
//       build,
//       name: name.trim(),
//       description: description.trim(),
//       icon: {
//         value: icon.value.trim(),
//         icon_type: icon.icon_type,
//       },
//       category: category.trim(),
//       expected_completion_time: completionTime,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Roadmap created successfully",
//       data: roadmap,
//     });
//   } catch (error) {
//     console.error("Create roadmap error:", error);

//     if (error instanceof mongoose.Error.ValidationError) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

export const createRoadmap = async (req: Request, res: Response) => {
  let uploadedKey: string | null = null;

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
      category = "",
      expected_completion_time,
    } = req.body;

    // Parse icon (FormData sends objects as strings)
    let icon = req.body.icon;

    if (typeof icon === "string") {
      try {
        icon = JSON.parse(icon);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid icon format",
        });
      }
    }

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

    // Validate icon
    if (
      !icon ||
      typeof icon !== "object" ||
      Array.isArray(icon) ||
      typeof icon.value !== "string" ||
      !["url", "upload", "icon"].includes(icon.icon_type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid icon. Provide a valid value and icon_type.",
      });
    }

    // Validate category
    if (typeof category !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Validate expected completion time
    let completionTime: any = {};

    let parsedTime = expected_completion_time;

    if (typeof parsedTime === "string") {
      try {
        parsedTime = JSON.parse(parsedTime);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid expected completion time",
        });
      }
    }

    if (parsedTime != null) {
      const { value, unit } = parsedTime;

      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
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

    // Handle icon based on icon_type
    let iconData = {
      value: icon.value.trim(),
      icon_type: icon.icon_type,
      s3_key: "",
    };

    if (icon.icon_type === "upload") {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an icon image",
        });
      }

      // Upload image to AWS S3
      const uploadedImage = await uploadToS3(req.file as any);

      uploadedKey = uploadedImage.key;

      iconData = {
        value: uploadedImage.url,
        icon_type: "upload",
        s3_key: uploadedImage.key,
      };
    } else {
      // File should not be received for icon/url types
      if (req.file) {
        return res.status(400).json({
          success: false,
          message: "File upload is only allowed for upload icon type",
        });
      }

      if (!iconData.value) {
        return res.status(400).json({
          success: false,
          message: "Icon value is required",
        });
      }
    }

    // Create roadmap
    const roadmap = await Roadmap.create({
      userID,
      build,
      name: name.trim(),
      description: description.trim(),
      icon: iconData,
      category: category.trim(),
      expected_completion_time: completionTime,
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap created successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Create roadmap error:", error);

    // Cleanup uploaded image if roadmap creation fails
    if (uploadedKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uploadedKey,
          }),
        );
      } catch (deleteError) {
        console.error("S3 cleanup error:", deleteError);
      }
    }

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

export const getRoadmaps = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      page = "1",
      limit = "10",
      search = "",
      category = "",
      build = "",
      sort = "newest",
    } = req.query;

    // Pagination
    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * pageLimit;

    // Filters
    const filter: any = { userID };

    if (typeof search === "string" && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }

    if (["manual", "ai"].includes(build as string)) {
      filter.build = build;
    }

    // Sorting
    const sortOptions: Record<string, any> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      recently_updated: { updatedAt: -1 },
    };

    const sortBy = sortOptions[sort as string] || sortOptions.newest;

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filter).sort(sortBy).skip(skip).limit(pageLimit).lean(),

      Roadmap.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Roadmaps fetched successfully",
      data: roadmaps,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
        hasNextPage: currentPage * pageLimit < total,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get roadmaps error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
