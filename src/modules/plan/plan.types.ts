export interface PlanI {
  planName: string; // monthly, yearly, quarterly, half-yearly
  planType: string; // free, paid
  no_of_months: number;
  amount: number;
  description: string;
}
