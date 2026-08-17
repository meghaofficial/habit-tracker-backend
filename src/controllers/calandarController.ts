import { Request, Response } from "express";
import Calandar from "../models/calandarModel";

export const createCalandarData = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { day, month, year, status, title } = req.body;
    const description = req.body.description ? req.body.description : "";

    if (!day || !month || !year || !status || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing field detected",
      });
    }

    const existingData = await Calandar.findOne({ userID, month, year, day });
    if (existingData) {
      return res.status(409).json({
        success: false,
        message: "Already exists",
      });
    }

    const newCalandarData = await Calandar.create({
      userID,
      year,
      month,
      day,
      status,
      title,
      description,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newCalandarData._id,
        date: new Date(year, month, day),
        status,
        title,
        description,
        updatedAt: newCalandarData.updatedAt,
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

export const getCalandarData = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Missing field detected",
      });
    }

    const dataResults = await Calandar.find({ userID, month: Number(month), year: Number(year) });

    const formattedDataRes = dataResults.map((data) => ({
      id: data._id,
      date: new Date(data.year, data.month, data.day),
      status: data.status,
      title: data.title,
      description: data.description,
      updatedAt: data.updatedAt,
    }));

    return res.status(201).json({
      success: true,
      data: formattedDataRes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateCalandarData = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { id, status, title, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing task ID",
      });
    }

    const updatedData = await Calandar.findOneAndUpdate(
      { _id: id, userID },
      { status, title, description },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updatedData._id,
        date: new Date(updatedData.year, updatedData.month, updatedData.day),
        status: updatedData.status,
        title: updatedData.title,
        description: updatedData.description,
        updatedAt: updatedData.updatedAt,
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

export const deleteCalandarData = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing task ID",
      });
    }

    const deletedData = await Calandar.findOneAndDelete({ _id: id, userID });

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully Deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
