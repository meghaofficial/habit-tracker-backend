import nodeCron from "node-cron";
import User from "../modules/auth/auth.model";

export const removeRefreshToken = async () => {
  nodeCron.schedule(
    "0 0 * * *",
    async () => {
      await User.updateMany(
        {},
        {
          $pull: {
            refreshTokens: {
              expiresAt: { $lt: new Date() },
            },
          },
        },
      );
    },
    {
      timezone: "UTC",
    },
  );
};
