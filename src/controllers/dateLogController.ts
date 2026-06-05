import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";
import {
  DateLogModel,
  MonthlyTargetsModel,
  MonthNoteModel,
  WeeklyTargetsModel,
} from "../models/dateLogModel";
import { TaskModel } from "../models/dateLogModel";
import mongoose from "mongoose";
import { getIO } from "../socket/socket";

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

    let [monthDetail, existingLogs, tasks] = await Promise.all([
      MonthModel.findById(monthDashID).lean(),
      DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).lean(),
      TaskModel.find({ monthDashID }).lean(),
    ]);

    if (!monthDetail) {
      return res.status(404).json({
        success: false,
        message: "Month Dashboard not found.",
      });
    }

    const { month, year, totalDays } = monthDetail;

    if (existingLogs.length === 0) {
      const logsToCreate = Array.from({ length: totalDays }, (_, i) => {
        return {
          monthDashID,
          fullDate: new Date(Date.UTC(year, month, i + 1)),
          tasks: [],
        };
      });

      const insertedLogs = await DateLogModel.insertMany(logsToCreate, {
        ordered: false,
      });

      existingLogs = insertedLogs.map((doc) => doc.toObject());
    }

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

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "monthDashID and taskName are required",
      });
    }

    // count tasks
    const totalTasks = await TaskModel.countDocuments({
      monthDashID,
    });

    if (totalTasks >= 10) {
      return res.status(409).json({
        success: false,
        message: "Maximum 10 tasks allowed",
      });
    }

    // create task
    await TaskModel.create({
      monthDashID,
      taskName: taskName.trim(),
    });

    // run queries in parallel
    const [allTasks, existingLogs] = await Promise.all([
      TaskModel.find({ monthDashID }).lean(),

      DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).lean(),
    ]);

    const taskIDs = allTasks.map((task) => task._id.toString());

    const progress = calculateProgress(
      existingLogs.map((log) => ({
        fullDate: log.fullDate,
        tasks: log.tasks.map((task) => task.toString()),
      })),
      taskIDs,
    );

    const io = getIO();

    io.to(userID).emit("add-task", {
      tasks: allTasks,
      progress,
    });

    return res.status(201).json({
      success: true,
      tasks: allTasks,
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

    const monthDashID = req.query.monthDashID as string;
    const fullDate = req.query.fullDate as string;
    const taskID = req.query.taskID as string;

    const { marked } = req.body;

    if (!monthDashID || !fullDate || !taskID || typeof marked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const dateObj = new Date(fullDate);
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth();
    const day = dateObj.getUTCDate();
    const normalizedUtcDate = new Date(Date.UTC(year, month, day));

    const filter = {
      monthDashID,
      fullDate: normalizedUtcDate,
    };

    const update = marked
      ? {
          $addToSet: {
            tasks: taskID,
          },
          $setOnInsert: {
            monthDashID,
            fullDate: normalizedUtcDate,
          },
        }
      : {
          $pull: {
            tasks: taskID,
          },
          $setOnInsert: {
            monthDashID,
            fullDate: normalizedUtcDate,
          },
        };

    const updatedDateLog = await DateLogModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).lean();

    const [existingLogs, tasks] = await Promise.all([
      DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).lean(),
      TaskModel.find({ monthDashID }).select("_id").lean(),
    ]);

    const taskIDs = tasks.map((t) => t._id.toString());

    const progress = calculateProgress(
      existingLogs.map((log) => ({
        fullDate: log.fullDate,
        tasks: log.tasks.map((task) => task.toString()),
      })),
      taskIDs,
    );

    const io = getIO();

    io.to(userID).emit("task-marked", {
      dateLogID: updatedDateLog._id,
      dateLog: updatedDateLog,
      progress,
      taskID,
      marked,
    });

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

    if (!mongoose.Types.ObjectId.isValid(taskID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
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

    // remove task references from logs
    await DateLogModel.updateMany(
      { monthDashID },
      {
        $pull: {
          tasks: taskID,
        },
      },
    );

    // parallel queries
    const [remainingTasks, existingLogs] = await Promise.all([
      TaskModel.find({ monthDashID }).lean(),

      DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).lean(),
    ]);

    const taskIDs = remainingTasks.map((task) => task._id.toString());

    const progress = calculateProgress(
      existingLogs.map((log) => ({
        fullDate: log.fullDate,
        tasks: log.tasks.map((task) => task.toString()),
      })),
      taskIDs,
    );

    const io = getIO();

    io.to(userID).emit("remove-task", {
      tasks: remainingTasks,
      progress,
    });

    return res.status(200).json({
      success: true,
      tasks: remainingTasks,
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

    const io = getIO();

    io.to(userID).emit("update-task", {
      task: updatedTask,
    });

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
      target: targets,
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

export const getWeeklyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const week = Number(req.query.week);

    if (!monthDashID || !week) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID & week no are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (week < 1 || week > 5) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 5",
      });
    }

    const targets = await WeeklyTargetsModel.findOne({
      monthDashID,
      week,
    }).lean();

    return res.status(200).json({
      success: true,
      target: targets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const addWeeklyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const week = Number(req.query.week);

    const { target } = req.body;

    // validations
    if (!monthDashID || !week || !target) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID, week & target are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (week < 1 || week > 5) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 5",
      });
    }

    if (typeof target !== "string" || !target.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target must be a valid string",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // add target
    const updatedTarget = await WeeklyTargetsModel.findOneAndUpdate(
      {
        monthDashID,
        week,
      },
      {
        $push: {
          targets: {
            value: target.trim(),
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      target: updatedTarget,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeWeeklyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const week = Number(req.query.week);
    const targetID = req.query.targetID as string;

    if (!monthDashID || !week || !targetID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID, week & target ID are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Target ID",
      });
    }

    if (week < 1 || week > 5) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 5",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedDoc = await WeeklyTargetsModel.findOneAndUpdate(
      {
        monthDashID,
        week,
      },
      {
        $pull: {
          targets: {
            _id: targetID,
          },
        },
      },
      {
        new: true,
      },
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "Weekly targets not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Removed target successfully",
      target: updatedDoc,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateWeeklyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const week = Number(req.query.week);
    const targetID = req.query.targetID as string;

    const { target } = req.body;

    // validations
    if (!monthDashID || !week || !targetID || !target) {
      return res.status(400).json({
        success: false,
        message: "monthDashID, week, targetID and target are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Target ID",
      });
    }

    if (week < 1 || week > 5) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 5",
      });
    }

    if (typeof target !== "string" || !target.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target must be a valid string",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updated = await WeeklyTargetsModel.findOneAndUpdate(
      {
        monthDashID,
        week,
        "targets._id": targetID,
      },
      {
        $set: {
          "targets.$.value": target.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
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

export const markWeeklyTargets = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const monthDashID = req.query.monthDashID as string;
    const week = Number(req.query.week);
    const targetID = req.query.targetID as string;

    const { mark } = req.body;

    // validations
    if (typeof mark !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Mark must be boolean",
      });
    }

    if (!monthDashID || !week || !targetID) {
      return res.status(400).json({
        success: false,
        message: "monthDashID, week and targetID are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Target ID",
      });
    }

    if (week < 1 || week > 5) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 5",
      });
    }

    // ownership check
    const dashboardExists = await MonthModel.exists({
      _id: monthDashID,
      userID,
    });

    if (!dashboardExists) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updated = await WeeklyTargetsModel.findOneAndUpdate(
      {
        monthDashID,
        week,
        "targets._id": targetID,
      },
      {
        $set: {
          "targets.$.completed": mark,
        },
      },
      {
        new: true,
      },
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

export const resetDatelog = async (req: Request, res: Response) => {
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
        message: "monthDashID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(monthDashID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Month Dashboard ID",
      });
    }

    const existingLogs = await DateLogModel.exists({
      monthDashID,
    });

    if (!existingLogs) {
      return res.status(404).json({
        success: false,
        message: "No log found",
      });
    }

    await DateLogModel.updateMany(
      { monthDashID },
      {
        $set: {
          tasks: [],
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Reset Successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
