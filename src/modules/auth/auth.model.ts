import mongoose from "mongoose";
import { IUser } from "./auth.types";

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String },
  createdAt: { type: Date },
  expiresAt: { type: Date },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, trim: true },
    provider: {
      type: String,
      enum: ["local", "google", "github", "twitter"],
      default: "local",
    },
    providerId: { type: String },
    refreshTokens: [RefreshTokenSchema],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    role: {
      type: String,
      default: "user",
      trim: true,
      enum: ["user", "admin"],
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
