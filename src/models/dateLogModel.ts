import mongoose from "mongoose";
import { DateLogI, MonthlyNoteI, MonthlyTargetsI, TaskI, WeeklyTargetsI } from "../types";

const taskSchema = new mongoose.Schema(
  {
    monthDashID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Month",
      required: true,
      index: true,
    },
    taskName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

const dateLogSchema = new mongoose.Schema(
  {
    monthDashID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Month",
      required: true,
    },
    fullDate: {
      type: Date,
      required: true,
    },
    // stores only completed task IDs
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Task",
      default: [],
    },
  },
  { timestamps: true },
);

dateLogSchema.index({ monthDashID: 1, fullDate: 1 }, { unique: true });

const monthNoteSchema = new mongoose.Schema({
  monthDashID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MonthDashboard",
    index: true,
    required: true,
    unique: true,
  },
  note: String,
}, { timestamps: true });

const monthlyTargetSchema = new mongoose.Schema({
  monthDashID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MonthDashboard",
    required: true,
  },

  targets: {
    type: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false
        }
      },
    ],
    validate: [
      (arr: { value: string }[]) => arr.length <= 10,

      "Max 10 targets allowed",
    ],
  },
});

monthlyTargetSchema.index({ monthDashID: 1 }, { unique: true });

const weeklyTargetSchema = new mongoose.Schema({
  monthDashID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MonthDashboard",
    required: true,
    index: true,
  },
  week: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  targets: {
    type: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false
        }
      },
    ],
    validate: [
      (arr: { value: string }[]) => arr.length <= 10,
      "Max 10 targets allowed",
    ],
  },
});

weeklyTargetSchema.index({ monthDashID: 1, week: 1 }, { unique: true });

export const TaskModel = mongoose.model<TaskI>("Task", taskSchema);

export const DateLogModel = mongoose.model<DateLogI>("DateLog", dateLogSchema);

export const MonthNoteModel = mongoose.model<MonthlyNoteI>(
  "MonthNote",
  monthNoteSchema,
);

export const MonthlyTargetsModel = mongoose.model<MonthlyTargetsI>(
  "MonthlyTargets",
  monthlyTargetSchema,
);

export const WeeklyTargetsModel = mongoose.model<WeeklyTargetsI>(
  "WeeklyTargets",
  weeklyTargetSchema,
);
