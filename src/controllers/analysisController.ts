import { Request, Response } from "express";
import { DateLogModel, TaskModel } from "../models/dateLogModel";

export const getTodayActivity = async (
  req: Request,
  res: Response
) => {
  try {

const today = new Date();

const dateKey = `${
  today.getFullYear()
}-${String(today.getMonth() + 1).padStart(2, '0')}-${
  String(today.getDate()).padStart(2, '0')
}`;

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

    const completedTasks =
      existingLog.tasks?.length || 0;

    const progress =
      totalTasks > 0
        ? ((completedTasks / totalTasks) * 100).toFixed(2)
        : "0.00";

    return res.status(200).json({
      success: true,
      date: dateKey,
      progress,
      existingLog
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

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
