export type SubscriptionPlanT = {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  stripePriceId: string;
  videoLimit: number;
  minutesLimit: number;
  isActive: boolean;
};
