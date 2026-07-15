import mongoose from "mongoose";
import { HistoryI } from "../types";

const historySchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  monthDashID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Month",
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 0,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  overallProgress: Number,
  monthlyTargets: [String],
  monthlyNote: String,
  taskList: [
    {
      taskID: {
        type: String,
        required: true,
      },
      taskName: {
        type: String,
        required: true,
      },
      progress: Number,
      dates: [
        {
          dateNo: {
            type: Number,
            required: true,
            min: 1,
            max: 31,
          },
          taskMarked: {
            type: Boolean,
            required: true,
            default: false,
          },
        },
      ],
    },
  ],
  missedTasksByDay: [
    {
      dateNo: {
        type: Number,
        required: true,
        min: 1,
        max: 31,
      },
      progress: Number,
      tasks: [
        {
          taskID: {
            type: String,
            required: true,
          },
          taskName: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  weekProgress: [{
    week: {
      type: Number,
      min: 1,
      max: 5,
    },
    progress: {
      type: Number,
      default: 0,
    },
  }],
});

historySchema.index({ userID: 1, monthDashID: 1 }, { unique: true });

const History = mongoose.model<HistoryI>("History", historySchema);

export default History;
