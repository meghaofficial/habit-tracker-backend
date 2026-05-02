import mongoose from "mongoose";

interface PlanI {
  planName: string; // monthly, yearly, quarterly, half-yearly
  planType: string;  // free, paid
  no_of_months: number;
  amount: number;
}

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
  }
});

const Plan = mongoose.model<PlanI>("Plan", planSchema);

export default Plan;