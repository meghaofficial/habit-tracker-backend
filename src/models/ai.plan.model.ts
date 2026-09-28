import mongoose from "mongoose";
import { z } from "zod";

export const RequestSchema = z.object({
  goals: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
  dailyMinutes: z.number().int().min(5).max(480),
  daysRemaining: z.number().int().min(1).max(31),
  existingHabits: z
    .array(z.string().trim().min(1).max(100))
    .max(10)
    .default([]),
});

export const aiPlanSchema = z.object({
  summary: z.string(),
  habits: z.array(
    z.object({
      taskName: z.string(),
      minutesPerDay: z.number(),
      reason: z.string(),
    }),
  ),
  monthlyTargets: z.array(z.string()),
  weeklyTargets: z.array(
    z.object({
      week: z.number(),
      targets: z.array(z.string()),
    }),
  ),
  dailyTargets: z.array(
    z.object({
      day: z.number(),
      targets: z.array(z.string()),
    }),
  ),
  monthlyNote: z.string(),
  expectedProgress: z.string(),
});
