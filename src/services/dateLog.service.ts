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

export const deleteTask = async ({ session, taskID, monthDashID, }: any) => {
  const deletedTask = await TaskModel.findOneAndDelete( { _id: taskID, monthDashID, }, { session, } );

  if (!deletedTask) {
    throw new Error("Task not found");
  }

  const totalTasks = await TaskModel.countDocuments({ monthDashID, }).session(session);

  return { deletedTask, totalTasks, };
};

export const updateDateLogsAfterTaskDelete = async ({ session, taskID, monthDashID, totalTasks, }: any)=> {

  const dateLogs = await DateLogModel.find({ monthDashID, }).sort({ fullDate: 1 }).session(session);

  let overallCount = 0;

  const response: any[] = [];

  const bulkOps = dateLogs.map((log) => {
    const tasks = log.tasks.filter(
      id => id.toString() !== taskID
    );
    const count = tasks.length;
    const progress = totalTasks === 0 ? "0" : findProgress(count, totalTasks);
    overallCount += count;
    response.push({
      fullDate: log.fullDate,
      count,
      progress,
    });

    return {
      updateOne: {
        filter: { _id: log._id, },
        update: { $set: { tasks, count, progress, }, },
      },
    };
  });

  if (bulkOps.length) {
    await DateLogModel.bulkWrite(
      bulkOps,
      { session }
    );
  }

  return { overallCount, dateLogProgress: response, };
};

export const updateMonthAfterTaskDelete = async ({ session, monthDashID, totalTasks, totalDays, overallCount, }: any) => {

  const overallTotal = totalTasks * totalDays;
  const progress = overallTotal === 0 ? "0" : findProgress( overallCount, overallTotal );

  await MonthModel.findByIdAndUpdate(
    monthDashID,
    { totalCount: overallCount, progress, totalTasks },
    { session, }
  );

  return {
    total: overallTotal,
    count: overallCount,
    progress,
  };
};