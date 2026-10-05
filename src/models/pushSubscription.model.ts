import { Schema, model } from "mongoose";

const pushSubscriptionSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true },
);

export const PushSubscriptionModel = model(
  "PushSubscription",
  pushSubscriptionSchema,
);
