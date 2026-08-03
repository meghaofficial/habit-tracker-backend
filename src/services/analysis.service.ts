import { ClientSession } from "mongoose";
import Analysis from "../models/AnalysisModel";
import { DateLogI } from "../types";

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
      (d) => d.fullDate.getTime() === date.getTime(),
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

export const updateAnalysis = async ({
  session,
  monthDashID,
  dateLogs,
  totalTasks,
}: {
  session: ClientSession;
  monthDashID: string;
  dateLogs: DateLogI[];
  totalTasks: number;
}) => {
  const { perfectDays, streak, perfectStreak } = calculateTopLevelAnalysis({
    dateLogs,
    totalTasks,
  });

  await Analysis.findOneAndUpdate(
    { monthDashID },
    {
      perfectDays,
      streak,
      perfectStreak,
    },
    {
      upsert: true,
      new: true,
      session,
    },
  );
};
