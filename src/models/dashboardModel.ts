import mongoose, { Schema, Types } from "mongoose";

// interface IMonth extends mongoose.Document {
//   userId: mongoose.Types.ObjectId;
//   year: number;
//   month: number;
//   habits: mongoose.Types.ObjectId[];
//   targets: {
//     monthly: Array<{ goal: string; isDone: boolean }>;
//     weekly: Array<{ week: number; goals: Array<{ goal: string; isDone: boolean }> }>;
//   };
//   note: string;
// }

// interface IHabit extends mongoose.Document {
//   userId: mongoose.Types.ObjectId;
//   title: string;
// }

// interface IDailyLog extends mongoose.Document {
//   userId: mongoose.Types.ObjectId;
//   date: Date;
//   habits: Array<{ habitId: mongoose.Types.ObjectId; done: boolean }>;
//   note: string;
//   status: "default" | "important" | "event" | "achievement" | "sick";
// }

// const HabitSchema = new mongoose.Schema({
//   userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true },
// }, { timestamps: true });

// const MonthSchema = new mongoose.Schema({
//   userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
//   year: Number,
//   month: Number,

//   habits: [
//     { type: mongoose.Types.ObjectId, ref: "Habit" }
//   ],

//   targets: {
//     monthly: [
//       {
//         goal: String,
//         isDone: Boolean
//       }
//     ],
//     weekly: [
//       {
//         week: Number,
//         goals: [
//           {
//             goal: String,
//             isDone: Boolean
//           }
//         ]
//       }
//     ]
//   },

//   note: String
// }, { timestamps: true });

// const DailyLogSchema = new mongoose.Schema({
//   userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },

//   date: { type: Date, required: true },

//   habits: [
//     {
//       habitId: { type: mongoose.Types.ObjectId, ref: "Habit" },
//       done: Boolean
//     }
//   ],

//   note: String,

//   status: {
//     type: String,
//     enum: ["default", "important", "event", "achievement", "sick"],
//     default: "default"
//   }

// }, { timestamps: true });

// const Month = mongoose.model<IMonth>("Month", MonthSchema);
// const DailyLog = mongoose.model<IDailyLog>("DailyLog", DailyLogSchema);
// const Habit = mongoose.model<IHabit>("Habit", HabitSchema);

// export { Month, DailyLog, Habit };

// 1. Define interfaces for Sub-documents
interface ITarget {
  id: string;
  note: string;
  isDone: boolean;
}

interface ITaskData {
  checkboxKey: string;
  fullDate: string;
  isChecked: boolean;
}

interface ITask {
  _id: string;
  name: string;
  taskData: ITaskData[];
}

interface IDayNote {
  id: string;
  fullDate: string;
  note: string;
  status: "default" | "important" | "event" | "achievement" | "sick";
}

// 2. Define the main Month interface
export interface IMonth extends Document {
  userId: Types.ObjectId;
  year: number;
  month: number;
  note?: string;
  startDateNum: number;
  totalDays: number;
  overallDays: number;
  monthlyTargets?: ITarget[];
  weeklyTargets?: {
    week: number;
    targets: ITarget[];
  }[];
  taskList: ITask[];
  daywiseData: {
    fullDate: string;
    count: number;
  }[];
  dayNote?: IDayNote[];
  createdAt: Date;
  updatedAt: Date;
}

// 3. Create the Schema
const MonthSchema = new Schema<IMonth>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  year: { type: Number, required: true, index: true },
  month: { type: Number, required: true, index: true, min: 1, max: 12 },
  totalDays: { type: Number, required: true },
  startDateNum: Number,
  overallDays: Number,
  note: String,

  monthlyTargets: {
    type: [{
      id: { type: String, default: () => new Types.ObjectId().toHexString() },
      note: String,
      isDone: { type: Boolean, default: false }
    }],
    validate: [(v: ITarget[]) => v.length <= 7, '{PATH} exceeds limit of 7']
  },

  weeklyTargets: {
    type: [{
      week: { type: Number, enum: [1, 2, 3, 4, 5] },
      targets: [{
        id: { type: String, default: () => new Types.ObjectId().toHexString() },
        note: String,
        isDone: { type: Boolean, default: false }
      }]
    }],
    validate: [(v: any[]) => v.length <= 5, '{PATH} exceeds limit of 5']
  },

  taskList: {
    type: [{
      name: String,
      taskData: [{
        checkboxKey: String,
        fullDate: String,
        isChecked: { type: Boolean, default: false }
      }]
    }],
    validate: [(v: ITask[]) => v.length <= 10, '{PATH} exceeds limit of 10 tasks']
  },

  daywiseData: {
    type: [{
      fullDate: String,
      count: { type: Number, default: 0 }
    }],
    validate: [(v: any[]) => v.length <= 31, '{PATH} exceeds limit of 31']
  },

  dayNote: {
    type: [{
      id: { type: String, default: () => new Types.ObjectId().toHexString() },
      fullDate: String,
      note: String,
      status: {
        type: String,
        enum: ["default", "important", "event", "achievement", "sick"],
        default: "default"
      }
    }],
    validate: [(v: IDayNote[]) => v.length <= 31, '{PATH} exceeds limit of 31']
  }
}, { timestamps: true });

// Compound index for fast retrieval
MonthSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const MonthModel = mongoose.model<IMonth>('Month', MonthSchema);