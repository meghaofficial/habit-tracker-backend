import cron from "node-cron";
import Subscription from "../models/subscription";

export const startSubscriptionCron = () => {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Running subscription cron...");

    const today = new Date();

    try {
      // ✅ Activate pending subscriptions
      await Subscription.updateMany(
        {
          status: "pending",
          startDate: { $lte: today },
        },
        {
          $set: { status: "active" },
        }
      );

      // ✅ Expire old subscriptions
      await Subscription.updateMany(
        {
          status: "active",
          endDate: { $lt: today },
        },
        {
          $set: { status: "expired" },
        }
      );

      console.log("✅ Subscription cron completed");
    } catch (error) {
      console.error("❌ Cron failed:", error);
    }
  });
};