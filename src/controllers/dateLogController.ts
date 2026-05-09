import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";
import {
  DateLogModel,
  MonthlyTargetsModel,
  MonthNoteModel,
} from "../models/dateLogModel";
import { TaskModel } from "../models/dateLogModel";

export const getDateLog = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { monthDashID } = req.query;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required.",
      });
    }

    const monthDetail = await MonthModel.findById(monthDashID).lean();

    if (!monthDetail) {
      return res.status(404).json({
        success: false,
        message: "Month Dashboard not found.",
      });
    }

    const { month, year, totalDays } = monthDetail;

    let existingLogs = await DateLogModel.find({ monthDashID }).lean();

    if (existingLogs.length === 0) {
      const logsToCreate = Array.from({ length: totalDays }, (_, i) => ({
        userID,
        monthDashID,
        fullDate: new Date(year, month - 1, i + 1),
        tasks: [],
      }));

      await DateLogModel.insertMany(logsToCreate, {
        ordered: false,
      });

      existingLogs = await DateLogModel.find({ monthDashID }).lean();
    }

    const tasks = await TaskModel.find({
      monthDashID,
    }).lean();
    const taskIDs = tasks.map((t) => t._id.toString());
    const progress = calculateProgress(
      existingLogs.map((log) => ({
        fullDate: log.fullDate,
        tasks: log.tasks.map((task) => task.toString()),
      })),
      taskIDs,
    );

    return res.status(200).json({
      success: true,
      dateLogs: existingLogs,
      progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const { taskName } = req.body;

    const totalTasks = await TaskModel.countDocuments({
      monthDashID,
    });

    if (totalTasks >= 10) {
      return res.status(409).json({
        success: false,
        message: "Maximum 10 tasks allowed",
      });
    }

    await TaskModel.create({
      monthDashID,
      taskName,
    });

    const allTasks = await TaskModel.find({
      monthDashID,
    });

    return res.status(201).json({
      success: true,
      tasks: allTasks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;

    const allTasks = await TaskModel.find({
      monthDashID,
    });

    return res.status(201).json({
      success: true,
      tasks: allTasks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const markTask = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { monthDashID, fullDate, taskID } = req.query;
    const { marked } = req.body;

    if (!monthDashID || !fullDate || !taskID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing.",
      });
    }

    const normalizedDate = new Date(fullDate as string);

    normalizedDate.setHours(0, 0, 0, 0);

    const filter = {
      monthDashID,
      fullDate: normalizedDate,
    };

    //   const update = marked
    // ? {
    //     $addToSet: {
    //       tasks: taskID,
    //     },
    //   }
    // : {
    //     $pull: {
    //       tasks: taskID,
    //     },
    //   };

    const update = marked
      ? {
          $addToSet: {
            tasks: taskID,
          },
          $setOnInsert: {
            monthDashID,
            fullDate: normalizedDate,
          },
        }
      : {
          $pull: {
            tasks: taskID,
          },
          $setOnInsert: {
            monthDashID,
            fullDate: normalizedDate,
          },
        };

    const updatedDateLog = await DateLogModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).lean();

    let existingLogs = await DateLogModel.find({ monthDashID }).lean();

    const tasks = await TaskModel.find({
      monthDashID,
    }).lean();
    const taskIDs = tasks.map((t) => t._id.toString());
    const progress = calculateProgress(
      existingLogs.map((log) => ({
        fullDate: log.fullDate,
        tasks: log.tasks.map((task) => task.toString()),
      })),
      taskIDs,
    );

    return res.status(200).json({
      success: true,
      dateLog: updatedDateLog,
      progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeTask = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const taskID = req.query.taskID as string;
    const monthDashID = req.query.monthDashID as string;

    if (!taskID || !monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const deletedTask = await TaskModel.findOneAndDelete({
      _id: taskID,
      monthDashID,
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await DateLogModel.updateMany(
      { monthDashID },
      {
        $pull: {
          tasks: taskID,
        },
      },
    );

    const remainingTasks = await TaskModel.find({ monthDashID });

    return res.status(200).json({
      success: true,
      tasks: remainingTasks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const taskID = req.query.taskID as string;
    const { taskName } = req.body;

    if (!taskID) {
      return res.status(400).json({
        success: false,
        message: "TaskID is required",
      });
    }

    // if (!taskName || !taskName.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Task name is required"
    //   });
    // }

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: taskID },
      {
        $set: {
          taskName: taskName.trim(),
        },
      },
      {
        new: true,
      },
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

function calculateProgress(
  filteredDateLogs: {
    fullDate: Date;
    tasks: string[];
  }[],
  tasksList: string[],
) {
  const totalDays = filteredDateLogs.length * tasksList.length;

  let totalCount = 0;

  const dateLogProgress: {
    fullDate: Date;
    count: number;
    progress: number | string;
  }[] = [];

  filteredDateLogs.forEach((d) => {
    totalCount += d.tasks.length;

    dateLogProgress.push({
      fullDate: d.fullDate,
      count: d.tasks.length,
      progress: ((d.tasks.length / tasksList.length) * 100).toFixed(2),
    });
  });

  const overallProgress = {
    total: totalDays,
    count: totalCount,
    progress: ((totalCount / totalDays) * 100).toFixed(2),
  };

  const taskProgress: {
    id: string;
    count: number;
    progress: number | string;
  }[] = [];

  tasksList.forEach((t) => {
    const count = filteredDateLogs.filter((d) => d.tasks.includes(t)).length;

    const progress = ((count / filteredDateLogs.length) * 100).toFixed(2);

    taskProgress.push({
      id: t,
      count,
      progress,
    });
  });

  return {
    overallProgress,
    dateLogProgress,
    taskProgress,
  };
}

export const getMonthlyNote = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required",
      });
    }

    const note = await MonthNoteModel.findOne({
      monthDashID,
    }).lean();

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateMonthlyNote = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;

    const { note } = req.body;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required",
      });
    }

    const updatedNote = await MonthNoteModel.findOneAndUpdate(
      { monthDashID },
      { $set: { note } },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      success: true,
      note: updatedNote,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMonthlyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required",
      });
    }

    const targets = await MonthlyTargetsModel.findOne({
      monthDashID,
    }).lean();

    return res.status(200).json({
      success: true,
      monthlyTargets: targets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const addMonthlyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;

    const { target } = req.body;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required",
      });
    }

    const newTarget = await MonthlyTargetsModel.findOneAndUpdate(
      { monthDashID },
      { $push: { targets: { value: target } } },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      success: true,
      target: newTarget,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeMonthlyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const targetID = req.query.targetID as string;

    if (!monthDashID || !targetID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required",
      });
    }

    await MonthlyTargetsModel.findOneAndUpdate(
      { monthDashID },
      { $pull: { targets: { _id: targetID } } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Removed target successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateMonthlyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const targetID = req.query.targetID as string;

    const { target } = req.body;

    if (!monthDashID || !targetID) {
      return res.status(400).json({
        success: false,
        message: "monthDashID and targetID are required",
      });
    }

    const updated = await MonthlyTargetsModel.findOneAndUpdate(
      { monthDashID, "targets._id": targetID },
      { $set: { "targets.$.value": target } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Target not found",
      });
    }

    return res.status(200).json({
      success: true,
      target: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const markMonthlyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const targetID = req.query.targetID as string;

    const { mark } = req.body;

    if (typeof mark !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Mark must be boolean",
      });
    }

    if (!monthDashID || !targetID) {
      return res.status(400).json({
        success: false,
        message: "monthDashID and targetID are required",
      });
    }

    const updated = await MonthlyTargetsModel.findOneAndUpdate(
      { monthDashID, "targets._id": targetID },
      { $set: { "targets.$.completed": mark } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Target not found",
      });
    }

    return res.status(200).json({
      success: true,
      target: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
