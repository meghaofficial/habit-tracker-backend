import { Request, Response } from "express";
import { DateLogModel, TaskModel } from "../models/dateLogModel";

export const getTodayActivity = async (req: Request, res: Response) => {
  try {
    const today = new Date();

    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;

    const existingLog = await DateLogModel.findOne({
      fullDate: dateKey,
    }).lean();

    if (!existingLog) {
      return res.status(200).json({
        success: true,
        date: dateKey,
        progress: "0.00",
      });
    }

    const totalTasks = await TaskModel.countDocuments({
      monthDashID: existingLog.monthDashID,
    });

    const completedTasks = existingLog.tasks?.length || 0;

    const progress =
      totalTasks > 0
        ? ((completedTasks / totalTasks) * 100).toFixed(2)
        : "0.00";

    return res.status(200).json({
      success: true,
      date: dateKey,
      progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getWeeklyActivity = async (req: Request, res: Response) => {
  try {
    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const today = new Date();

    const currentDate = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let startDate = 1;
    let endDate = 7;
    let weekNo = 1;

    if (currentDate >= 1 && currentDate <= 7) {
      startDate = 1;
      endDate = 7;
      weekNo = 1;
    } else if (currentDate >= 8 && currentDate <= 14) {
      startDate = 8;
      endDate = 14;
      weekNo = 2;
    } else if (currentDate >= 15 && currentDate <= 21) {
      startDate = 15;
      endDate = 21;
      weekNo = 3;
    } else if (currentDate >= 22 && currentDate <= 28) {
      startDate = 22;
      endDate = 28;
      weekNo = 4;
    } else {
      startDate = 29;
      // last date of month
      endDate = new Date(currentYear, currentMonth + 1, 0).getDate();
      weekNo = 5;
    }

    const rangeStart = new Date(Date.UTC(currentYear, currentMonth, startDate));

    const rangeEnd = new Date(
      Date.UTC(currentYear, currentMonth, endDate, 23, 59, 59, 999),
    );

    const dateLogs = await DateLogModel.find({
      fullDate: {
        $gte: rangeStart,
        $lte: rangeEnd,
      },
      monthDashID,
    })
      .sort({ fullDate: 1 })
      .lean();

    const weekDays: string[] = [];
    const taskDone: number[] = [];

    const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = startDate; i <= endDate; i++) {
      const current = new Date(currentYear, currentMonth, i);
      const log = dateLogs.find(
        (item) => new Date(item.fullDate).getDate() === i,
      );
      weekDays.push(`${i} ${weekDayNames[current.getDay()]}`);
      taskDone.push(log?.tasks?.length || 0);
    }

    return res.status(200).json({
      success: true,
      data: {
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`,
        week: `Week ${weekNo}`,
        range: `${startDate}-${endDate}`,
        weekDays,
        taskDone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMonthlyActivity = async (req: Request, res: Response) => {
  try {
    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existingLogs = await DateLogModel.find({ monthDashID })
      .sort({ fullDate: 1 })
      .lean();

    if (!existingLogs) {
      return res.status(404).json({
        success: false,
        message: "Can't find the logs",
      });
    }

    const dates: number[] = [];
    const tasks: number[] = [];

    existingLogs.forEach((d) => {
      dates.push(new Date(d?.fullDate).getDate());
      tasks.push(d?.tasks?.length);
    });

    return res.status(200).json({
      success: true,
      data: {
        dates,
        tasks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getLogByDate = async (req: Request, res: Response) => {
  try {

    const fullDate = req.query.fullDate as string;
    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID || !fullDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const dateLog = await DateLogModel.findOne({ monthDashID, fullDate });

    if (!dateLog){
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    return res.status(200).json({
      success: true,
      dateLog
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

// export const getTodayActivity = async (req: Request, res: Response) => {
//   try {

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     })
//   }
// }
