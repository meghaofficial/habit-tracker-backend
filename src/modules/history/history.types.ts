export interface HistoryTaskListI {
  taskID: string;
  taskName: string;
  progress: number | string;
  dates: {
    dateNo: number;
    taskMarked: boolean;
  }[];
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
  taskList: HistoryTaskListI[];
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
