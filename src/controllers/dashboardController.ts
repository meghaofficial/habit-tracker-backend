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
    const currMonth = currDate.getMonth();

    const year = Number(req.query.year) || currYear;
    const month = Number(req.query.month) || currMonth;

    const existingMonth = await MonthModel.findOne({ userID, year, month });
    if (!existingMonth) {
      const newMonth = await MonthModel.create({
        userID,
        year,
        month,
        totalDays: new Date(year, month+1, 0).getDate(),
        firstDay: new Date(year, month, 1).getDay()
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
      error
    });
  }
};