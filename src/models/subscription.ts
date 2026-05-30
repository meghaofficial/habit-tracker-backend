import mongoose from "mongoose";
import { SubscriptionI } from "../types";

const subscriptionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  planID: {
    type: mongoose.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  planType: {
    type: String,
    enum: ["free", "paid"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "expired", "scheduled", "cancelled"],
    default: "active",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "free"],
    default: "free"
  }
}, { timestamps: true });

subscriptionSchema.index({ userID: 1, status: 1 });
subscriptionSchema.index({ userID: 1, planType: 1 });
subscriptionSchema.index({ userID: 1, endDate: -1 });

const Subscription = mongoose.model<SubscriptionI>("Subscription", subscriptionSchema);

export default Subscription;