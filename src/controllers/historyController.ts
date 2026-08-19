import { Request, Response } from "express";
import { MonthModel } from "../models/dashboardModel";

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
