import mongoose from "mongoose";
import { IOtp } from "../types";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    username: String,
    password: String,

    otp: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["signup", "forgot-password", "email-verification"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    resendCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 }, { unique: true });

const OTP = mongoose.model<IOtp>("OTP", otpSchema);

export default OTP;
