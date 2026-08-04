import mongoose from "mongoose";
import { AnalysisI } from "../types";

const analysisSchema = new mongoose.Schema(
  {
    monthDashID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Month",
      required: true,
      index: true,
    },
    perfectDays: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    perfectStreak: {
      type: Number,
      default: 0
    },
    mostConsistentHabits: {
      type: [String],
      default: []
    },
    leastConsistentHabits: {
      type: [String],
      default: []
    }
  },
  { timestamps: true },
);

const Analysis = mongoose.model<AnalysisI>("Analysis", analysisSchema);

export default Analysis;
