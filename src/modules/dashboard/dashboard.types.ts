export interface MonthDashboardI {
  userID: string;
  month: number;
  year: number;
  totalDays: number;
  firstDay: number; // storing which day is on the first date of month
  totalTasks: number;
  totalCount: number;
  progress: string;
}
