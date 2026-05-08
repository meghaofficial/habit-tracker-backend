import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";
import { DateLogModel } from "../models/dateLogModel";
import { TaskModel } from "../models/dateLogModel";

export const getDateLog = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { monthDashID } = req.query;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required."
      });
    }

    const monthDetail = await MonthModel.findById(monthDashID).lean();

    if (!monthDetail) {
      return res.status(404).json({
        success: false,
        message: "Month Dashboard not found."
      });
    }

    const { month, year, totalDays } = monthDetail;

    let existingLogs = await DateLogModel
      .find({ monthDashID })
      .lean();

    if (existingLogs.length === 0) {

      const logsToCreate = Array.from(
        { length: totalDays },
        (_, i) => ({
          userID,
          monthDashID,
          fullDate: new Date(year, month - 1, i + 1),
          tasks: []
        })
      );

      await DateLogModel.insertMany(logsToCreate, {
        ordered: false
      });

      existingLogs = await DateLogModel
        .find({ monthDashID })
        .lean();
    }

    return res.status(200).json({
      success: true,
      dateLogs: existingLogs
    });
 
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {

    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    } 

    const monthDashID = req.query.monthDashID as string;
    const { taskName } = req.body;

    const totalTasks = await TaskModel.countDocuments({
      monthDashID
    });

    if (totalTasks >= 10) {
      return res.status(409).json({
        success: false,
        message: "Maximum 10 tasks allowed"
      });
    }

    await TaskModel.create({
      monthDashID,
      taskName
    });

    const allTasks = await TaskModel.find({
      monthDashID
    });

    return res.status(201).json({
      success: true,
      tasks: allTasks
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });

  }
};

export const getTask = async (req: Request, res: Response) => {
  try {

    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    } 

    const monthDashID = req.query.monthDashID as string;

    const allTasks = await TaskModel.find({
      monthDashID
    });

    return res.status(201).json({
      success: true,
      tasks: allTasks
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });

  }
};

export const markTask = async (
  req: Request,
  res: Response
) => {
  try {

    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { monthDashID, fullDate, taskID } = req.query;
    const { marked } = req.body;

    if (
      !monthDashID ||
      !fullDate ||
      !taskID
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing."
      });
    }

    const normalizedDate =
      new Date(fullDate as string);

    normalizedDate.setHours(0, 0, 0, 0);

    const filter = {
      monthDashID,
      fullDate: normalizedDate
    };

    const update = marked
      ? {
          $addToSet: {
            tasks: taskID
          }
        }
      : {
          $pull: {
            tasks: taskID
          }
        };

    const updatedDateLog =
      await DateLogModel.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
          upsert: true
        }
      ).lean();

    return res.status(200).json({
      success: true,
      dateLog: updatedDateLog,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });

  }
};

export const removeTask = async (
  req: Request,
  res: Response
) => {

  try {

    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const taskID = req.query.taskID as string;
    const monthDashID = req.query.monthDashID as string;

    if (!taskID || !monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const deletedTask =
      await TaskModel.findOneAndDelete({
        _id: taskID,
        monthDashID
      });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    await DateLogModel.updateMany(
      { monthDashID },
      {
        $pull: {
          tasks: taskID
        }
      }
    );

    const remainingTasks =
      await TaskModel.find({ monthDashID });

    return res.status(200).json({
      success: true,
      tasks: remainingTasks
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });

  }
};