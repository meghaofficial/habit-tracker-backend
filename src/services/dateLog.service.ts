import { findProgress } from "../helper/utils";
import { MonthModel } from "../models/dashboardModel";
import { DateLogModel, TaskModel } from "../models/dateLogModel";

export const updateDateLog = async ({ session, monthDashID, taskID, marked, normalizedUtcDate, totalTasks }: any) => {
 const filter = { monthDashID, fullDate: normalizedUtcDate, };

  const update = marked ? 
      {
        $addToSet: { tasks: taskID, },
        $setOnInsert: { monthDashID, fullDate: normalizedUtcDate, },
      } : 
      {
        $pull: { tasks: taskID, },
        $setOnInsert: { monthDashID, fullDate: normalizedUtcDate, },
      };

  const updated = await DateLogModel.findOneAndUpdate(filter, update, { new: true, upsert: true, session, });

  if (!updated) {
    throw new Error("DateLog update failed");
  }

  updated.count = updated.tasks.length;
  updated.progress = findProgress(updated.count, totalTasks);

  await updated.save({ session });

  // await DateLogModel.updateOne(
  //   { _id: updated._id, },
  //   { $set: { count: updated.tasks.length, progress: findProgress(updated.tasks.length, totalTasks), } },
  //   { session, }
  // );

  return {
    count: updated.count,
    progress: updated.progress,
  };
};

export const updateTaskProgress = async ({ session, monthDashID, taskID, daysInMonth, dateLogs }: any) => {

  let count = 0;

  for (const log of dateLogs) {
    if (log.tasks.some((id: string) => id.toString() === taskID)) {
      count++;
    }
  }

  const progress = findProgress(count, daysInMonth);

  await TaskModel.findOneAndUpdate(
    { _id: taskID, monthDashID, },
    { count, progress, },
    { new: true, session, },
  );

  return {
    count,
    progress,
  };
};

export const updateMonthProgress = async ({ session, monthDashID, overallTotal, dateLogs }: any) => {

  let overallCount = 0;

  for (const log of dateLogs) {
    overallCount += log.tasks.length;
  }

  const progress = findProgress(
    overallCount,
    overallTotal
  );

  await MonthModel.findOneAndUpdate(
    {
      _id: monthDashID,
    },
    {
      totalCount: overallCount,
      progress,
    },
    {
      session,
    }
  );

  return {
    count: overallCount,
    progress,
  };
};