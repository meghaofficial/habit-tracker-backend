type DurationUnit = "days" | "weeks" | "months" | "years";

interface ExpectedCompletionTime {
  value: number;
  unit: DurationUnit;
}

interface RoadmapTimeResult {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  utilisedPercentage: number;
  remainingPercentage: number;
  status: "upcoming" | "in-progress" | "overdue";
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getStartDate = (today: Date, unit: DurationUnit): Date => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (unit) {
    case "days":
      date.setDate(date.getDate() + 1);
      break;

    case "weeks":
      if (date.getDay() !== 1 && date.getDay() !== 2) {
        const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
        date.setDate(date.getDate() + daysUntilMonday);
      }
      break;

    case "months":
      if (date.getDate() > 10) {
        date.setDate(1);
        date.setMonth(date.getMonth() + 1);
      } else {
        date.setDate(1);
      }
      break;

    case "years":
      date.setDate(1);
      break;
  }

  return date;
};

const getEndDate = (
  startDate: Date,
  duration: ExpectedCompletionTime,
): Date => {
  const endDate = new Date(startDate);

  switch (duration.unit) {
    case "days":
      endDate.setDate(endDate.getDate() + duration.value);
      break;

    case "weeks":
      endDate.setDate(endDate.getDate() + duration.value * 7);
      break;

    case "months":
      endDate.setMonth(endDate.getMonth() + duration.value);
      break;

    case "years":
      endDate.setFullYear(endDate.getFullYear() + duration.value);
      break;
  }

  return endDate;
};

export const calculateRoadmapTime = (
  createdAt: Date | string,
  duration: ExpectedCompletionTime,
  now: Date = new Date(),
): RoadmapTimeResult => {
  const today = new Date(now);
  const startDate = getStartDate(today, duration.unit);
  const endDate = getEndDate(startDate, duration);

  const totalDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY),
  );

  const currentTime = today.getTime();

  const elapsedDays = Math.max(
    0,
    Math.min(
      totalDays,
      Math.floor((currentTime - startDate.getTime()) / MS_PER_DAY),
    ),
  );

  const remainingDays = Math.max(
    0,
    Math.ceil((endDate.getTime() - currentTime) / MS_PER_DAY),
  );

  const utilisedPercentage = Math.min(
    100,
    Math.max(0, Math.round((elapsedDays / totalDays) * 100)),
  );

  const remainingPercentage = 100 - utilisedPercentage;

  let status: RoadmapTimeResult["status"];

  if (currentTime < startDate.getTime()) {
    status = "upcoming";
  } else if (currentTime >= endDate.getTime()) {
    status = "overdue";
  } else {
    status = "in-progress";
  }

  return {
    startDate,
    endDate,
    totalDays,
    elapsedDays,
    remainingDays,
    utilisedPercentage,
    remainingPercentage,
    status,
  };
};
