import mongoose from "mongoose";

interface TaskI {
  monthDashID: string;
  taskName: string;
}

interface DateLogI {
  monthDashID: string;
  fullDate: Date;
  tasks: string[];
}

const taskSchema = new mongoose.Schema({
  monthDashID: {
    type: mongoose.Types.ObjectId,
    ref: "Month",
    required: true,
    index: true
  },

  taskName: {
    type: String,
    trim: true,
    default: ""
  }

}, { timestamps: true });

const dateLogSchema = new mongoose.Schema({

  monthDashID: {
    type: mongoose.Types.ObjectId,
    ref: "Month",
    required: true,
    index: true
  },

  fullDate: {
    type: Date,
    required: true
  },

  // stores only completed task IDs
  tasks: {
    type: [mongoose.Types.ObjectId],
    ref: "Task",
    default: []
  }

}, { timestamps: true });

dateLogSchema.index(
  { monthDashID: 1, fullDate: 1 },
  { unique: true }
);

export const TaskModel =
  mongoose.model<TaskI>(
    "Task",
    taskSchema
  );

export const DateLogModel =
  mongoose.model<DateLogI>(
    "DateLog",
    dateLogSchema
  );