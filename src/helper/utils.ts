import { Types } from "mongoose";

export const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const addMonthsAndGetEnd = (start: Date, months: number) => {
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return getEndOfMonth(end);
};

export const getStartOfNextMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

export const calcFullDate = (yearNum: number, monthNum: number, index: number) => {
  const d = new Date(yearNum, monthNum - 1, index + 1);
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

export const createTaskData = (yearNum: number, monthNum: number, totalDays: number) => {
  const arr = Array.from({ length: totalDays }).map((_, index) => {
    const fullDate = calcFullDate(yearNum, monthNum, index);
    // index (0-6) row = 0, col = index
    // index (7-13) row = 1, col = index - 7
    // index (14-20) row = 2, col = index - 14
    // index (21-27) row = 3, col = index - 21
    // index (28-30) row = 4, col = index - 28
    const row = Math.floor(index / 7);
    const col = index % 7;
    const obj = {
      checkboxKey: `${new Types.ObjectId().toHexString()}-${row}-${col}`,
      fullDate,
      isChecked: false
    };
    return obj;
  });
  return arr;
}