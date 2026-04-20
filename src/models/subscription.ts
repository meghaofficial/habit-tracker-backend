import mongoose from "mongoose";

interface ISubscription {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: "active" | "cancelled" | "expired" | "pending";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentId?: string;
}

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);

export default Subscription;