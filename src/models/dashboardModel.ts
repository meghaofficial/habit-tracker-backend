import mongoose from "mongoose";
import { MonthDashboardI } from "../types";

const monthDashboardSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalDays: Number,
  firstDay: Number,
  totalCount: {
    type: Number,
    default: 0
  },
  progress: {
    type: String,
    default: "0"
  }
}, { timestamps: true });

monthDashboardSchema.index(
  { userID: 1, month: 1, year: 1 },
  { unique: true }
);

export const MonthModel = mongoose.model<MonthDashboardI>('Month', monthDashboardSchema);