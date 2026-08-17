import mongoose from "mongoose";
import { CalandarI } from "../types";

const calandarSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true, // 0-11 or 1-12, your choice
    },
    day: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "default",
      enum: ["default", "important", "event", "achievement", "sick"]
    },
    title: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Prevent duplicate entries for the same day
calandarSchema.index(
  { userID: 1, year: 1, month: 1, day: 1 },
  { unique: true }
);

// Speed up monthly queries
calandarSchema.index(
  { userID: 1, year: 1, month: 1 }
);

const Calandar = mongoose.model<CalandarI>("Calandar", calandarSchema);

export default Calandar;
