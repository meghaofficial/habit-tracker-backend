import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const subscription = (req as any).subscription;

    const currDate = new Date(subscription.startDate);
    const currYear = currDate.getUTCFullYear();
    const currMonth = currDate.getUTCMonth();

    const year =
      req.query.year !== undefined ? Number(req.query.year) : currYear;
    const month =
      req.query.month !== undefined ? Number(req.query.month) : currMonth;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const existingMonth = await MonthModel.findOne({ userID, year, month });
    if (!existingMonth) {
      const newMonth = await MonthModel.create({
        userID,
        year,
        month,
        totalDays,
        firstDay,
      });
      return res.status(201).json({
        success: true,
        monthData: newMonth,
      });
    }
    return res.status(200).json({
      success: true,
      monthData: existingMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};
