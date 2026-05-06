import mongoose from "mongoose";

interface MonthDashboardI {
  userID: string;
  month: number;
  year: number;
  totalDays: number;
  firstDay: number;    // storing which day is on the first date of month
};
const monthDashboardSchema = new mongoose.Schema({
  userID: { type: mongoose.Types.ObjectId, ref: "User", index: true, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalDays: Number,
  firstDay: Number,
}, { timestamps: true });

monthDashboardSchema.index(
  { userID: 1, month: 1, year: 1 },
  { unique: true }
);

export const MonthModel = mongoose.model<MonthDashboardI>('Month', monthDashboardSchema);