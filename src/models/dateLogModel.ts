// import mongoose from "mongoose";

// interface DateLogsI {
//   userID: string;
//   monthDashID: string;
//   fullDate: Date;
//   // tasks: {
//   //   [taskID: string]: boolean
//   // }  // storing which day is on the first date of month
//   tasks: { taskID: string, taskName: string, marked: boolean }[]
// };

// const dateLogSchema = new mongoose.Schema({
//   userID: {
//     type: mongoose.Types.ObjectId,
//     ref: "User",
//     required: true,
//     index: true
//   },
//   monthDashID: {
//     type: mongoose.Types.ObjectId,
//     ref: "Month",
//     required: true,
//     index: true
//   },
//   fullDate: { type: Date, required: true },
//   tasks: [
//     {
//       taskID: {
//         type: String,
//         required: true
//       },
//       taskName: {
//         type: String,
//         required: true
//       },
//       marked: {
//         type: Boolean,
//         default: false
//       }
//     }
//   ]

// }, { timestamps: true });

// dateLogSchema.index(
//   { userID: 1, fullDate: 1 },
//   { unique: true }
// );

// export const DateLogModel = mongoose.model<DateLogsI>('DateLog', dateLogSchema);

import mongoose from "mongoose";

interface TaskLogI {
  taskID: string;
  taskName: string;
  marked: boolean;
}

interface DateLogsI {
  userID: string;
  monthDashID: string;
  fullDate: Date;
  tasks: TaskLogI[];
}

const taskSchema = new mongoose.Schema({
  taskID: {
    type: String,
    required: true
  },

  taskName: {
    type: String,
    required: true
  },

  marked: {
    type: Boolean,
    default: false
  }

}, { _id: false });

const dateLogSchema = new mongoose.Schema({

  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

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

  tasks: {
    type: [taskSchema],
    default: []
  }

}, { timestamps: true });

dateLogSchema.index(
  { userID: 1, fullDate: 1 },
  { unique: true }
);

export const DateLogModel =
  mongoose.model<DateLogsI>(
    "DateLog",
    dateLogSchema
  );