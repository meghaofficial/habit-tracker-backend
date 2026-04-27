import { Request, Response } from "express";
import User from "../models/authModel";
import { MonthModel } from "../models/dashboardModel";
import { createTaskData } from "../helper/utils";
import mongoose from "mongoose";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        access: false,
        message: "User not found"
      });
    }

    const reqData = req.body;

    if (!reqData || !reqData.year || !reqData.month) {

      const latestMonth = await MonthModel.findOne({ userId })
        .sort({ year: -1, month: -1 });

      if (!latestMonth) {
        return res.status(404).json({
          success: false,
          message: "Data not found"
        })
      }

      return res.status(200).json({
        success: true,
        data: latestMonth
      });

    }

    else {

      const monthData = await MonthModel.findOne({ userId, year: reqData.year, month: reqData.month });

      if (!monthData) {
        return res.status(404).json({
          success: false,
          message: "Data not found for the specified month and year"
        });
      }

      return res.status(200).json({
        success: true,
        data: monthData
      });

    }


  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        access: false,
        message: "User not found"
      });
    }

    const { year, month } = req.body;

    // check if month is subscribed by user or not

    const existingMonthData = await MonthModel.findOne({ userId, year, month });

    if (!existingMonthData) {
      return res.status(404).json({
        success: false,
        message: "Data not found for the specified month and year"
      });
    }

    const newTaskId = new mongoose.Types.ObjectId();

    const updatedTaskList = [
      ...existingMonthData.taskList,
      {
        _id: newTaskId,
        name: "",
        taskData: createTaskData(year, month, existingMonthData.totalDays),
        count: 0,
        progress: "0"
      }
    ];
    const updatedDaywiseData = existingMonthData.daywiseData.map(day => {
      return {
        ...day,
        taskData: [...day.taskData,
        {
          _id: new mongoose.Types.ObjectId(),
          taskId: newTaskId.toString(),
          checked: false
        }
        ],
        progress: ((day.count / updatedTaskList.length) * 100).toFixed(1)
      }
    });

    existingMonthData.overallDays += existingMonthData.totalDays;
    existingMonthData.taskList.push({
      _id: newTaskId,
      name: "",
      taskData: createTaskData(year, month, existingMonthData.totalDays),
      count: 0,
      progress: "0"
    });
    existingMonthData.daywiseData = updatedDaywiseData;

    await existingMonthData.save();

    res.status(200).json({
      success: true,
      data: existingMonthData,
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

export const removeTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { taskId, fullDate } = req.query;

    if (!taskId) {
      return res.status(400).json({ success: false, message: "Task ID required" });
    }

    if (!fullDate) {
      return res.status(400).json({ success: false, message: "Full date required" });
    }

    const existingMonthData = await MonthModel.findOne({ userId, "taskList._id": taskId });

    if (!existingMonthData) {
      return res.status(404).json({ success: false, message: "Task or Month not found" });
    }

    if (existingMonthData.taskList.length === 1) {
      return res.status(400).json({ success: false, message: "At least one task must be present" });
    }

    const updatedTaskList = existingMonthData.taskList.filter(task => task._id.toString() !== taskId);
    const updatedDaywiseData = existingMonthData.daywiseData.map(day => {
      let updatedCnt = day.count;
      const updatedTaskData = day.taskData.filter(td => {
        if (td.taskId === taskId) {
          if (td.checked) {
            updatedCnt -= 1;
          }
        }
        return td.taskId !== taskId
      });
      return {
        ...day,
        taskData: updatedTaskData,
        count: updatedCnt,
        progress: ((updatedCnt / updatedTaskList.length) * 100).toFixed(1)
      }
    });

    existingMonthData.overallDays -= existingMonthData.totalDays;
    existingMonthData.taskList = updatedTaskList;
    existingMonthData.daywiseData = updatedDaywiseData;

    await existingMonthData.save();

    res.status(200).json({
      success: true,
      message: "Task removed and progress recalculated",
      data: existingMonthData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const updateTaskCheckData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { taskId, checkboxKey } = req.query;
    const { isChecked, fullDate } = req.body; // fullDate should be "1-1-2024"

    const existingMonthData = await MonthModel.findOne({ userId, "taskList._id": taskId });

    if (!existingMonthData) {
      return res.status(404).json({ success: false, message: "Task or Month not found" });
    }

    const updatedTaskList = existingMonthData.taskList.filter(task => {
      if (task._id.toString() === taskId) {
        task.taskData = task.taskData.map(td => {
          if (td.checkboxKey === checkboxKey) {
            td.isChecked = isChecked;
          }
          return td;
        });
        task.count = isChecked ? task.count + 1 : task.count - 1;
        task.progress = ((task.count / existingMonthData.totalDays) * 100).toFixed(1);
      }
      return task;
    });


    const updatedDaywiseData = existingMonthData.daywiseData.map(day => {

      if (day.fullDate === fullDate) {
        day.taskData = day.taskData.map(td => {
          if (td.taskId === taskId) {
            td.checked = isChecked;
          }
          return td;
        });
        day.count = isChecked ? day.count + 1 : day.count - 1;
        day.progress = ((day.count / updatedTaskList.length) * 100).toFixed(1);
        return day;
      }

      return day;
    });

    existingMonthData.taskList = updatedTaskList;
    existingMonthData.daywiseData = updatedDaywiseData;

    await existingMonthData.save();

    res.status(200).json({
      success: true,
      message: "Progress updated",
      data: existingMonthData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateTaskName = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user.id;
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ success: false, message: "Task ID required" });
    }

    const { taskName } = req.body;

    const updatedMonth = await MonthModel.findOneAndUpdate(
      { userId, "taskList._id": taskId },
      {
        $set: {
          "taskList.$.name": taskName
        }
      },
      { new: true }
    );

    if (!updatedMonth) {
      return res.status(404).json({ success: false, message: "Task or Month not found" });
    }

    res.status(200).json({
      success: true,
      message: "Task name updated",
      data: updatedMonth
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
}

export const getData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("hasUsedTrial trialStartDate trialEndDate");

    if (!user) {
      return res.status(404).json({
        success: false,
        access: false,
        message: "User not found"
      });
    }

    let month = -1;
    let year = -1;

    if (user?.hasUsedTrial && user?.trialEndDate) {
      month = user.trialEndDate.getMonth() + 1;
      year = user.trialEndDate.getFullYear();
    }

    // check for paid subscription

    // const { year, month } = req.query;

    if (!userId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: "User ID, year and month are required"
      });
    }

    const data = await MonthModel.findOne({ userId, year: Number(year), month: Number(month) });

    const calculatingTaskWiseProgress = (): { taskId: string; count: number; total: number; progress: string | number }[] => {
      const total = data?.totalDays || 0;

      const checked: { taskId: string; count: number; total: number; progress: string | number }[] = [];

      data?.taskList.forEach((task) => {
        const checkedCount = task.taskData.filter((td) => td.isChecked).length;
        checked.push({
          taskId: task._id,
          count: checkedCount,
          total,
          progress: total > 0 ? ((checkedCount / total) * 100).toFixed(1) : 0
        });
      });

      return checked;
    };

    // const calculatingDaywiseProgress = (): { fullDate: string; count: number; total: number; progress: string | number }[] => {
    //   const arr: { fullDate: string; count: number; total: number; progress: string | number }[] = [];

    //   const total = data?.taskList.length || 0;

    //   data?.daywiseData.forEach((day) => {
    //     arr.push({
    //       fullDate: day.fullDate,
    //       count: day.count,
    //       total,
    //       progress: day.count > 0 ? ((day.count / total) * 100).toFixed(1) : 0
    //     });
    //   });

    //   return arr;
    // };

    const calculatingOverallProgress = (): { total: number; count: number; progress: string | number } => {
      const total = data?.overallDays || 0;
      const checkedCount = data?.taskList.reduce((acc, task) => {
        return acc + task.taskData.filter(td => td.isChecked).length;
      }, 0) || 0;

      return {
        total,
        count: checkedCount,
        progress: total > 0 ? ((checkedCount / total) * 100).toFixed(1) : 0
      };
    };

    res.status(200).json({
      success: true,
      data: {
        month_year: [`${data?.month}-${data?.year}`],
        firstDay: data?.startDateNum || 1,
        totalDays: data?.totalDays || 0,
        overallDays: data?.overallDays || 0,
        note: data?.note || "",
        taskList: data?.taskList || [],
        taskWiseProgress: calculatingTaskWiseProgress(),
        // daywiseData: data?.daywiseData || [],
        overallProgress: calculatingOverallProgress()
      },
      data2: data
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};