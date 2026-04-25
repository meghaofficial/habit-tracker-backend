import { Types } from "mongoose";

interface IUser {
  _id: Types.ObjectId;
  trialEndDate?: Date;
}

type AccessStrategy = (user: IUser, now: Date) => Promise<boolean>;

const strategies: AccessStrategy[] = [
  async (user, now) => {
    return !!(user.trialEndDate && user.trialEndDate > now);
  },
  // async (user) => {
  //   const sub = await Subscription.findOne({
  //     userId: user._id,
  //     status: "active",
  //     endDate: { $gt: now }
  //   });

  //   return !!sub;
  // }
];

export const hasAccess = async (user: IUser) => {
  const now = new Date();

  for (const strategy of strategies) {
    if (await strategy(user, now)) return true;
  }
  return false;
};