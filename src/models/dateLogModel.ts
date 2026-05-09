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

interface MonthlyNoteI{
    monthDashID: string;
    note: string;
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

const monthNoteSchema = new mongoose.Schema({
    monthDashID: { type: mongoose.Types.ObjectId, ref: "MonthDashboard", index: true, required: true, unique: true },
    note: String,
});

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

export const MonthNoteModel =
  mongoose.model<MonthlyNoteI>(
    "MonthNote",
    monthNoteSchema
  );