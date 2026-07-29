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
import { findProgress } from "../helper/utils";
import { deleteTask, updateDateLog, updateDateLogsAfterTaskDelete, updateMonthAfterTaskDelete, updateMonthProgress, updateTaskProgress } from "../services/dateLog.service";

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
        tasks: log?.tasks?.map((task) => task.toString()),
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

  const session = await mongoose.startSession();

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

    let response: any;

    await session.withTransaction(async () => {

      // Ownership
      const dashboard = await MonthModel.findOne({
        _id: monthDashID,
        userID,
      }).session(session);

      if (!dashboard) {
        throw new Error("Access denied");
      }

      // Existing data
      const [tasks, dateLogs] = await Promise.all([
        TaskModel.find({ monthDashID }).sort({ fullDate: 1 }).session(session),
        DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).session(session),
      ]);

      if (tasks.length >= 10) {
        throw new Error("Maximum 10 tasks allowed");
      }

      // Create task
      const task = await TaskModel.create(
        [
          {
            monthDashID,
            taskName: taskName.trim(),
          },
        ],
        { session }
      );

      const totalTasks = tasks.length + 1;

      // Update every DateLog progress
      const updatedDateLogProgress = dateLogs.map((log) => {
        const progress = findProgress(log.tasks.length, totalTasks);

        return {
          fullDate: log.fullDate,
          count: log.count,
          progress,
        };
      });
      await DateLogModel.bulkWrite(
        dateLogs.map((log) => ({
          updateOne: {
            filter: { _id: log._id },
            update: {
              $set: {
                progress: findProgress(log.tasks.length, totalTasks),
              },
            },
          },
        })),
        { session }
      );

      // Update month progress
      const overallTotal = dashboard.totalDays * totalTasks;

      dashboard.progress = findProgress(
        dashboard.totalCount,
        overallTotal
      );

      await dashboard.save({ session });

      response = {
        task: task[0],
        progress: {
          overallProgress: {
            total: overallTotal,
            count: dashboard.totalCount,
            progress: dashboard.progress,
          },
          dateLogProgress: updatedDateLogProgress,
        },
      };

    });

    return res.status(201).json({
      success: true,
      ...response
    });

    // const io = getIO();

    // io.to(userID).emit("add-task", {
    //   tasks: allTasks,
    //   progress,
    // });

    // return res.status(201).json({});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  } finally {
    await session.endSession();
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
    const monthDashID = req.query.monthDashID as string;
    const taskID = req.query.taskID as string;
    const fullDate = req.query.fullDate as string;
    const { marked } = req.body;

    // ------------------ VALIDATIONS --------------------
    if (new Date(fullDate).getDate() !== new Date().getDate()) {
      return res.status(400).json({
        success: false,
        message: "Not allowed",
      });
    }
    if (!monthDashID || !fullDate || !taskID || typeof marked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
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

    // ------------------ OWNERSHIP --------------------
    const [dashboard, tasks] = await Promise.all([
      MonthModel.findOne({
        _id: monthDashID,
        userID,
      }),
      TaskModel.find({
        monthDashID,
      }).select("_id"),
    ]);

    if (!dashboard) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const totalTasks = tasks.length;
    const daysInMonth = dashboard.totalDays;
    const overallTotal = totalTasks * daysInMonth;
    const date = new Date(fullDate);
    const normalizedUtcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      )
    );
    const session = await mongoose.startSession();

    try {
      
      let response;

      await session.withTransaction(async () => {

        console.log("Transaction started");

        const day = await updateDateLog({
          session,
          monthDashID,
          taskID,
          marked,
          normalizedUtcDate,
          totalTasks,
        });
        console.log("DateLog done");

        const dateLogs = await DateLogModel.find({ monthDashID, }).session(session);

        const task = await updateTaskProgress({
          session,
          monthDashID,
          taskID,
          daysInMonth,
          dateLogs
        });
        console.log("Task done");

        const overall = await updateMonthProgress({
          session,
          monthDashID,
          overallTotal,
          dateLogs
        });
        console.log("Month done");

        console.log("Transaction committed");

        response = {
          overallProgress: {
            total: overallTotal,
            count: overall.count,
            progress: overall.progress,
          },
          dateLogProgress: {
            fullDate,
            count: day.count,
            progress: day.progress,
          },
          taskProgress: {
            id: taskID,
            count: task.count,
            progress: task.progress,
          },
        };

      });

      return res.status(200).json({
        success: true,
        progress: response,
      });

    } catch (error) {
      
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });

    } finally { 
      await session.endSession();
    }

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeTask = async (req: Request, res: Response) => {

  const session = await mongoose.startSession();

  try {
    const userID = (req as any).user?.id;
    const taskID = req.query.taskID as string;
    const monthDashID = req.query.monthDashID as string;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    let response: any;

    await session.withTransaction(async () => {

      const dashboard = await MonthModel.findOne({ _id: monthDashID, userID, }).session(session);

      if (!dashboard) {
        throw new Error("Access denied");
      }

      const { totalTasks } = await deleteTask({
        session,
        taskID,
        monthDashID,
      });

      const day = await updateDateLogsAfterTaskDelete({
        session,
        taskID,
        monthDashID,
        totalTasks,
      });

      const overall = await updateMonthAfterTaskDelete({
        session,
        monthDashID,
        totalTasks,
        totalDays: dashboard.totalDays,
        overallCount: day.overallCount,
      });

      response = {
          deletedTaskID: taskID,
          progress: {
              overallProgress: overall,
              dateLogProgress: day.dateLogProgress,
          },
      };

    });

    return res.status(200).json({
      success: true,
      ...response,
    });

    // const io = getIO();

    // io.to(userID).emit("remove-task", {
    //   tasks: remainingTasks,
    //   progress,
    // });

    // return res.status(200).json({});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  } finally {
    await session.endSession();
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

    return res.status(200).json({});
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
    totalCount += d?.tasks?.length;

    dateLogProgress.push({
      fullDate: d?.fullDate,
      count: d?.tasks?.length,
      progress: ((d?.tasks?.length / tasksList?.length) * 100).toFixed(2),
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
    const count = filteredDateLogs.filter((d) => d?.tasks?.includes(t)).length;

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

    const io = getIO();

    io.to(userID).emit("update-monthly-note", {
      note: updatedNote,
    });

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

    const io = getIO();

    io.to(userID).emit("add-monthly-target", {
      target: newTarget,
    });

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

    const updated = await MonthlyTargetsModel.findOneAndUpdate(
      { monthDashID },
      { $pull: { targets: { _id: targetID } } },
      { new: true },
    );

    const io = getIO();

    io.to(userID).emit("remove-monthly-target", {
      target: updated,
    });

    return res.status(200).json({});
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

    const io = getIO();

    io.to(userID).emit("mark-monthly-target", {
      target: updated,
    });

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
