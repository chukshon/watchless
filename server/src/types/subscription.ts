import { SubscriptionBillingInterval } from '@/constants/subscription';

export type SubscriptionPlanT = {
  name: string;
  description: string;
  price: number;
  duration: number;
  currency: string;
  billingInterval: SubscriptionBillingInterval;
  stripePriceId: string;
  videoLimit: number;
  minutesLimit: number;
  isActive: boolean;
};
