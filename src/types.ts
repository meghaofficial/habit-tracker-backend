export interface PlanI {
  planName: string; // monthly, yearly, quarterly, half-yearly
  planType: string; // free, paid
  no_of_months: number;
  amount: number;
  description: string;
}

export interface SubscriptionI {
  userID: string;
  planID: string;
  planType: string;
  timezone: string;
  startDate: Date;
  endDate: Date;
  status: string;
  paymentStatus?: string;
}

export interface MonthDashboardI {
  userID: string;
  month: number;
  year: number;
  totalDays: number;
  firstDay: number; // storing which day is on the first date of month
  totalCount: number;
  progress: string;
}

export interface TaskI {
  monthDashID: string;
  taskName: string;
  count: number;
  progress: string;
}

export interface DateLogI {
  monthDashID: string;
  fullDate: Date;
  tasks: string[];
  count: number;
  progress: string;
}

export interface MonthlyNoteI {
  monthDashID: string;
  note: string;
}

export interface MonthlyTargetsI {
  monthDashID: string;
  targets: { _id: string; value: string; completed: boolean }[];
}

export interface WeeklyTargetsI {
  monthDashID: string;
  week: number;
  targets: { _id: string; value: string; completed: boolean }[];
}

export interface IOtp {
  email: string;
  username?: string;
  password?: string;
  otp: string;
  type: string;
  expiresAt: Date;
}

export interface CalandarI {
  userID: string;
  year: number;
  month: number;
  day: number;
  status: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface HistoryTaskListI {
    taskID: string;
    taskName: string;
    progress: number | string;
    dates: {
      dateNo: number;
      taskMarked: boolean;
    }[]
  }
export interface HistoryI {
  userID: string;
  monthDashID: string;
  month: number;
  year: number;
  overallProgress: number | string;
  taskDone?: number;
  taskMissed?: number;
  totalHabits?: number;
  monthlyTargets: string[];
  monthlyNote: string;
  taskList: HistoryTaskListI[],
  missedTasksByDay: {
    dateNo: number;
    progress: number | string;
    tasks: {
      taskID: string;
      taskName: string;
    }[];
  }[];
  weekProgress: {
    week: number;
    progress: number;
  }[];
}

export interface OverallProgressI {
  total: number;
  count: number;
  progress: string | number;
}

export interface DateLogProgressI {
  fullDate: Date | string;
  count: number;
  progress: string | number;
}

export interface TaskProgressI {
  id: string;
  count: number;
  progress: string | number;
}

export interface ProgressI {
  overallProgress: OverallProgressI;
  dateLogProgress: DateLogProgressI[];
  taskProgress: TaskProgressI[];
}