import { Request, Response } from "express";
import History from "../models/historyModel";
import { MonthModel } from "../models/dashboardModel";
import { DateLogModel } from "../models/dateLogModel";
import { TaskModel } from "../models/dateLogModel";
import { MonthNoteModel } from "../models/dateLogModel";
import { MonthlyTargetsModel } from "../models/dateLogModel";
import { WeeklyTargetsModel } from "../models/dateLogModel";
import { HistoryTaskListI } from "../types";

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { monthDashID } = req.query;

    if (!monthDashID) {
      return res.status(404).json({
        success: false,
        message: "Missing details",
      });
    }

    const existingHistory = await History.findOne({ userID, monthDashID });

    if (existingHistory) {
      return res.status(200).json({
        success: true,
        data: existingHistory,
      });
    }

    const [
      monthDetail,
      allTasks,
      dateLog,
      monthlyTargets,
      monthlyNote,
      weeklyTargets,
    ] = await Promise.all([
      MonthModel.findById(monthDashID).lean(),
      TaskModel.find({ monthDashID }).lean(),
      DateLogModel.find({ monthDashID }).sort({ fullDate: 1 }).lean(),
      MonthlyTargetsModel.findOne({ monthDashID }).lean(),
      MonthNoteModel.findOne({ monthDashID }).lean(),
      WeeklyTargetsModel.find({ monthDashID }).lean(),
    ]);

    if (!monthDetail) {
      return res.status(404).json({
        success: false,
        message: "Month dashboard not found",
      });
    }

    const { month, year } = monthDetail;

    // Ensure unique date logs by day of the month to prevent duplicate log entries
    const uniqueLogsMap = new Map<number, (typeof dateLog)[0]>();
    dateLog.forEach((log) => {
      const dayNo = new Date(log.fullDate).getUTCDate();
      if (!uniqueLogsMap.has(dayNo)) {
        uniqueLogsMap.set(dayNo, log);
      } else {
        const existingLog = uniqueLogsMap.get(dayNo)!;
        const mergedTasks = Array.from(
          new Set([
            ...(existingLog.tasks || []).map((t) => t.toString()),
            ...(log.tasks || []).map((t) => t.toString()),
          ]),
        );
        existingLog.tasks = mergedTasks as any;
      }
    });
    const cleanDateLogs = Array.from(uniqueLogsMap.values()).sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime(),
    );

    // Overall progress & total habits
    const totalHabits = allTasks?.length || 0;
    const totalDays = cleanDateLogs.length * totalHabits;
    let totalCount = 0;
    cleanDateLogs.forEach((d) => {
      totalCount += d?.tasks?.length || 0;
    });
    const overallProgress =
      totalDays > 0 ? Number(((totalCount / totalDays) * 100).toFixed(2)) : 0;

    // Monthly targets
    const monthlyTargetsValues =
      monthlyTargets?.targets?.map((t) => t.value) || [];

    // Task list
    const taskList: HistoryTaskListI[] = [];

    allTasks.forEach((task) => {
      taskList.push({
        taskID: task._id.toString(),
        taskName: task.taskName || "UNNAMED TASK",
        progress: 0,
        dates: [],
      });
    });
    taskList.forEach((task) => {
      let cnt = 0;
      cleanDateLogs.forEach((log) => {
        const dateNo = new Date(log.fullDate).getUTCDate();
        const dateObj = {
          dateNo,
          taskMarked: false,
        };
        const tasks = log?.tasks || [];
        const found = tasks?.some(
          (t) => t.toString() === task.taskID.toString(),
        );
        dateObj.taskMarked = found;
        if (found) cnt++;
        task.dates.push(dateObj);
      });
      task.progress =
        cleanDateLogs.length > 0
          ? Number(((cnt / cleanDateLogs.length) * 100).toFixed(2))
          : 0;
    });

    // Missed tasks by days
    const missedTasksByDay = cleanDateLogs.map((log) => {
      const missedTasks = allTasks.filter(
        (task) =>
          !log?.tasks?.some((id) => id.toString() === task._id.toString()),
      );
      const tasks = missedTasks.map((t) => ({
        taskID: t?._id?.toString(),
        taskName: t?.taskName || "UNNAMED TASK",
      }));
      const dateNo = new Date(log.fullDate).getUTCDate() + 1; // +1 cause the first date it is showing the last date of the previous month
      return {
        dateNo,
        progress:
          totalHabits > 0
            ? Number(
                (((log?.tasks?.length || 0) / totalHabits) * 100).toFixed(2),
              )
            : 0,
        tasks,
      };
    });

    // week progress
    const weekProgress: {
      week: number;
      progress: number;
    }[] = [];
    for (let i = 0; i < cleanDateLogs.length; i += 7) {
      const end = Math.min(i + 7, cleanDateLogs.length);
      let totalTaskDone = 0;
      for (let j = i; j < end; j++) {
        totalTaskDone += cleanDateLogs[j].tasks.length;
      }
      const totalPossible = (end - i) * (allTasks.length || 1);
      const progress =
        totalPossible > 0
          ? Number(((totalTaskDone / totalPossible) * 100).toFixed(2))
          : 0;
      weekProgress.push({
        week: Math.floor(i / 7) + 1,
        progress,
      });
    }

    const newHistoryData = await History.create({
      userID,
      monthDashID: monthDashID.toString(),
      month,
      year,
      overallProgress,
      monthlyTargets: monthlyTargetsValues,
      monthlyNote: monthlyNote?.note ?? "",
      taskList,
      missedTasksByDay,
      weekProgress,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...newHistoryData.toObject(),
        taskDone: totalCount,
        taskMissed: totalDays - totalCount,
        totalHabits,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getDataOfPastMonths = async (req: Request, res: Response) => {
  try {
    
    const userID = (req as any).user?.id;

    const allData = await MonthModel.find({ userID }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: allData
    });

  } catch (error) {
    
  }
}
