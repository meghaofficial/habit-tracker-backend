export interface DailyTargetsI {
  monthDashID: string;
  dateNo: number;
  targets: { _id: string; value: string; completed: boolean }[];
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

export interface TaskI {
  monthDashID: string;
  taskName: string;
  count: number;
  progress: string;
  position: number;
}

export interface WeeklyTargetsI {
  monthDashID: string;
  week: number;
  targets: { _id: string; value: string; completed: boolean }[];
}
