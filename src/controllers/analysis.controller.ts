import { Request, Response } from "express";
import { DateLogModel, TaskModel } from "../models/dateLogModel";
import Analysis from "../models/AnalysisModel";
import { MonthModel } from "../models/dashboardModel";

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

    if (!dateLog) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    return res.status(200).json({
      success: true,
      dateLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getStreakWithMoreData = async (req: Request, res: Response) => {
  try {
    const monthDashID = req.query.monthDashID as string;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const tasks = await TaskModel.find({ monthDashID }).lean();
    const totalTasks = tasks.length;

    const logs = await DateLogModel.find({ monthDashID })
      .sort({ fullDate: 1 })
      .lean();

    if (!logs || logs.length === 0) {
      return res.status(200).json({
        success: true,
        streak: 0,
        longestStreak: 0,
        mostConsistentHabits: [],
        leastConsistentHabits: [],
      });
    }

    // Streak Logic

    const completedDaysSet = new Set<string>();
    logs.forEach((log: any) => {
      const completedTasks = log?.tasks?.length || 0;

      if (completedTasks === totalTasks) {
        const date = new Date(log.fullDate);
        const dateKey = date.toISOString().split("T")[0];

        completedDaysSet.add(dateKey);
      }
    });
    let currentStreak = 0;
    const today = new Date();
    while (true) {
      const tempDate = new Date(today);

      tempDate.setDate(today.getDate() - currentStreak);

      const dateKey = tempDate.toISOString().split("T")[0];

      if (completedDaysSet.has(dateKey)) {
        currentStreak++;
      } else {
        break;
      }
    }
    let longestStreak = 0;
    let running = 0;

    const sortedDates = [...completedDaysSet].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        running = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);

        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          running++;
        } else {
          running = 1;
        }
      }

      longestStreak = Math.max(longestStreak, running);
    }

    // taskID -> count
    const taskFollowCount: Record<string, number> = {};

    // initialize all tasks with 0
    tasks.forEach((task: any) => {
      taskFollowCount[task._id.toString()] = 0;
    });

    // count occurrences
    logs.forEach((log: any) => {
      const completedTasks = log?.tasks || [];

      completedTasks.forEach((task: any) => {
        const taskID =
          typeof task === "string"
            ? task
            : task?._id?.toString?.() || task?.toString?.();

        if (taskID && taskFollowCount[taskID] !== undefined) {
          taskFollowCount[taskID]++;
        }
      });
    });

    const counts = Object.values(taskFollowCount);

    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    let mostConsistentHabits: string[] = [];
    let leastConsistentHabits: string[] = [];

    // condition:
    // all habits = 0
    if (maxCount === 0 && minCount === 0) {
      mostConsistentHabits = [];
      leastConsistentHabits = [];
    }

    // condition:
    // all habits followed for all days
    else if (maxCount === logs.length && minCount === logs.length) {
      mostConsistentHabits = ["All"];
      leastConsistentHabits = ["All"];
    } else {
      tasks.forEach((task: any) => {
        const count = taskFollowCount[task._id.toString()];

        if (count === maxCount) {
          mostConsistentHabits.push(task.taskName);
        }

        if (count === minCount) {
          leastConsistentHabits.push(task.taskName);
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        streak: currentStreak,
        longestStreak,
        mostConsistentHabits,
        leastConsistentHabits,
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

// New Additions
export const getTopLevelAnalysis = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { monthDashID } = req.query;

    if (!monthDashID) {
      return res.status(400).json({
        success: false,
        message: "Month Dashboard ID is required.",
      });
    }

    const existingAnalysis = await Analysis.findOne({ monthDashID });
    const [dashboard, totalTasks] = await Promise.all([
      MonthModel.findOne({ _id: monthDashID, userID }),
      TaskModel.find({ monthDashID }).countDocuments(),
    ]);

    if (!dashboard) {
      return res.status(404).json({
        message: "Check your subscription plan",
      });
    }

    const date = new Date();
    const lastIndex = date.getDate();

    if (!existingAnalysis) {
      return res.status(404).json({
        success: false,
        data: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        consistencyRate: dashboard.progress,
        perfectDays: existingAnalysis.perfectDays,
        totalDaysInMonth: dashboard.totalDays,
        avgPerDay: dashboard.totalCount,
        timeElapsed: lastIndex * totalTasks,
        streak: existingAnalysis.streak,
        perfectStreak: existingAnalysis.perfectStreak,
        mostConsistentHabits: existingAnalysis.mostConsistentHabits || [],
        leastConsistentHabits: existingAnalysis.leastConsistentHabits || []
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
