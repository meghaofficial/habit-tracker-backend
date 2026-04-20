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