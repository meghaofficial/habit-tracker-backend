import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const currDate = new Date();
    const currYear = currDate.getFullYear();
    const currMonth = currDate.getMonth() + 1;

    const year = Number(req.query.year) || currYear;
    const month = Number(req.query.month) || currMonth;

    const existingMonth = await MonthModel.findOne({ userID, year, month });
    if (!existingMonth) {
      const newMonth = MonthModel.create({
        userID,
        year,
        month,
        totalDays: new Date(year, month, 0).getDate(),
        firstDay: new Date(year, month - 1, 1).getDay()
      });
      return res.status(201).json({
        success: true,
        monthData: newMonth
      });
    }
    return res.status(200).json({
      success: true,
      monthData: existingMonth
    });

    // const monthData = await MonthModel.findOneAndUpdate(
    //   { userID, year, month },
    //   {
    //     $setOnInsert: {
    //       userID,
    //       year,
    //       month,
    //       totalDays: new Date(year, month, 0).getDate(),
    //       firstDay: new Date(year, month - 1, 1).getDay()
    //     }
    //   },
    //   { new: true, upsert: true }
    // );

    // return res.status(200).json({
    //   success: true,
    //   data: monthData
    // });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error
    });
  }
};