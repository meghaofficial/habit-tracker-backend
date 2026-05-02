import mongoose from "mongoose";

interface SubscriptionI {
  userID: string;
  planID: string;
  planType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  paymentStatus?: string;
}

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
    index: true
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
    index: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "free"],
    default: "free"
  }

}, { timestamps: true });

const Subscription = mongoose.model<SubscriptionI>("Subscription", subscriptionSchema);

export default Subscription;