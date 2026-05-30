export interface PlanI {
  planName: string; // monthly, yearly, quarterly, half-yearly
  planType: string;  // free, paid
  no_of_months: number;
  amount: number;
  description: string;
}

export interface SubscriptionI {
  userID: string;
  planID: string;
  planType: string;
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
  firstDay: number;    // storing which day is on the first date of month
};

export interface TaskI {
  monthDashID: string;
  taskName: string;
}

export interface DateLogI {
  monthDashID: string;
  fullDate: Date;
  tasks: string[];
}

export interface MonthlyNoteI {
  monthDashID: string;
  note: string;
}

export interface MonthlyTargetsI {
  monthDashID: string;
  targets: { _id: string; value: string, completed: boolean }[];
}

export interface WeeklyTargetsI {
  monthDashID: string;
  week: number;
  targets: { _id: string; value: string, completed: boolean }[];
}