export interface SubscriptionI {
  userID: string;
  planID: string;
  planType: string;
  timezone: string;
  startDate: Date;
  endDate: Date;
  status: string;
  paymentStatus?: string;
}
