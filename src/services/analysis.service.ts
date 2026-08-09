import { ClientSession } from "mongoose";
import Analysis from "../models/AnalysisModel";
import { DateLogI, TaskI } from "../types";

export const calculateTopLevelAnalysis = ({
  dateLogs,
  totalTasks,
}: {
  dateLogs: DateLogI[];
  totalTasks: number;
}) => {
  let perfectDays = 0;
  let perfectStreak = 0;
  let streak = 0;

  if (totalTasks > 0) {
    // Perfect Days
    for (const log of dateLogs) {
      if (log.tasks.length === totalTasks) {
        perfectDays++;
      }
    }

    // Perfect Streak (Maximum consecutive perfect days)
    let currPerfectStreak = 0;

    for (const log of dateLogs) {
      if (log.tasks.length === totalTasks) {
        currPerfectStreak++;
        perfectStreak = Math.max(perfectStreak, currPerfectStreak);
      } else {
        currPerfectStreak = 0;
      }
    }

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const lastIdx = dateLogs.findIndex(
      (d) => d.fullDate.getDate() === date.getDate(),
    );

    // Current Streak (from today backwards)
    for (let i = lastIdx; i >= 0; i--) {
      if (dateLogs[i].tasks.length > 0) {
        streak++;
      } else {
        break;
      }
    }
  }

  return {
    perfectDays,
    streak,
    perfectStreak,
  };
};

export const calculateTopAndLeastConsistentHabits = ({
  tasks,
}: {
  tasks: TaskI[];
}) => {
  const totalTasks = tasks.length;
  const mostConsistentHabits: string[] = [];
  const leastConsistentHabits: string[] = [];

  const habits = {
    mostConsistentHabits,
    leastConsistentHabits,
  };

  if (tasks.length <= 0) {
    return habits;
  }

  const sortedTasks = [...tasks].sort((a, b) => b.count - a.count);

  if (sortedTasks[0].count === 0) {
    return habits;
  }

  const highest = sortedTasks[0].count;
  const lowest = sortedTasks[totalTasks - 1].count;

  sortedTasks.forEach((task) => {
    if (task.count === highest) {
      mostConsistentHabits.push(task.taskName);
    }

    if (task.count === lowest) {
      leastConsistentHabits.push(task.taskName);
    }
  });

  return habits;
};

export const updateAnalysis = async ({
  session,
  monthDashID,
  dateLogs,
  tasks,
}: {
  session: ClientSession;
  monthDashID: string;
  dateLogs: DateLogI[];
  tasks: TaskI[];
}) => {
  const totalTasks = tasks.length;
  const { perfectDays, streak, perfectStreak } = calculateTopLevelAnalysis({
    dateLogs,
    totalTasks,
  });

  const { mostConsistentHabits, leastConsistentHabits } =
    calculateTopAndLeastConsistentHabits({
      tasks,
    });

  await Analysis.findOneAndUpdate(
    { monthDashID },
    {
      perfectDays,
      streak,
      perfectStreak,
      mostConsistentHabits,
      leastConsistentHabits,
    },
    {
      upsert: true,
      new: true,
      session,
    },
  );
};
