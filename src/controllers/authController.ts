import bcrypt from "bcryptjs";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import crypto from "crypto";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req?.body;

    if (!username || !email || !password)
      return res.status(400).json({
        success: false,
        message: "Missing field",
      });

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req?.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Missing field",
      });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Email not exists",
      });

    if (user?.password) {
      const matched = await bcrypt.compare(password, user?.password);

      if (!matched)
        return res.status(400).json({
          success: false,
          message: "Wrong credentials",
        });

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" },
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: "7d" },
      );

      user.refreshToken = refreshToken;
      await user.save();

      return res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // MUST be false on localhost
          // sameSite: "strict",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json({
          success: true,
          accessToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.sendStatus(204);
    }

    const user = await User.findOne({ refreshToken: token });

    if (user) {
      user.refreshToken = "";
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.REFRESH_SECRET as string,
    );
    const user = await User.findById(decoded.id).select(
      "_id username email refreshToken",
    );

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" },
    );

    // res.json({ accessToken: newAccessToken });
    res.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const user = await User.findById(userId);

    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated",
    });
  } catch {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(404)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User does not exists" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.save();
    res.status(200).json({ success: true, message: "OTP sent" });

    // send email with token (link or OTP)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, new_password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(new_password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
