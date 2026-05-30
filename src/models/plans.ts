import mongoose from "mongoose";
import { PlanI } from "../types";

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    enum: ["monthly", "yearly", "quarterly", "half_yearly"]
  },
  planType: {
    type: String,
    required: true,
    enum: ["free", "paid"],
  },
  no_of_months: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    required: true
  }
});

const Plan = mongoose.model<PlanI>("Plan", planSchema);

export default Plan;