import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import OTP from "../models/otpModel";
import User from "../models/authModel";

export const verifySignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, enteredOTP } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const registeredOTP = await OTP.findOne({ email: normalizedEmail });

    if (!registeredOTP) {
      return res.status(404).json({
        success: false,
        message: "no otp found",
      });
    }

    if (registeredOTP.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isCorrect = await bcrypt.compare(enteredOTP, registeredOTP.otp);

    if (isCorrect) {
      const newUser = new User({
        username: registeredOTP?.username,
        email: normalizedEmail,
        password: registeredOTP?.password,
        isVerified: true,
      });
      await newUser.save();
      await OTP.deleteOne({
        _id: registeredOTP._id,
      });
      return res.status(201).json({
        success: true,
        message: "Verified",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Wrong OTP",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const cancelOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await OTP.deleteMany({
      email,
      type: "signup",
    });

    return res.status(200).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
