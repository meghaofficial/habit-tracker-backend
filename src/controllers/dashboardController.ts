import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const userID = (req as any).user?.id;
    const subscription = (req as any).subscription;

    const today = new Date();

    const currYear = today.getUTCFullYear();
    const currMonth = today.getUTCMonth();

    const year =
      req.query.year !== undefined
        ? Number(req.query.year)
        : currYear;

    const month =
      req.query.month !== undefined
        ? Number(req.query.month)
        : currMonth;

    const requestedDate = new Date(
      Date.UTC(year, month, 1)
    );

    const subscriptionStart = new Date(
      subscription.startDate
    );

    subscriptionStart.setUTCDate(1);
    subscriptionStart.setUTCHours(0, 0, 0, 0);

    const subscriptionEnd = new Date(
      subscription.endDate
    );

    subscriptionEnd.setUTCDate(1);
    subscriptionEnd.setUTCHours(0, 0, 0, 0);

    if (
      requestedDate < subscriptionStart ||
      requestedDate > subscriptionEnd
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This month is outside your subscription period",
      });
    }

    const totalDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    let monthData = await MonthModel.findOne({
      userID,
      year,
      month,
    });

    if (!monthData) {
      monthData = await MonthModel.create({
        userID,
        year,
        month,
        totalDays,
        firstDay,
      });

      return res.status(201).json({
        success: true,
        monthData,
      });
    }

    return res.status(200).json({
      success: true,
      monthData,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};