import { SubscriptionPlanT } from '@/types/subscription';
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  TRIAL = 'trial',
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanT[] = [
  {
    name: 'Basic',
    description: 'Basic subscription plan',
    price: 9.99,
    currency: 'USD',
    billingInterval: 'monthly',
    stripePriceId: 'price_1QZQZQZQZQZQZQZQZQZQZQZQ',
    videoLimit: 10,
    minutesLimit: 60,
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Premium plan with more features',
    price: 19.99,
    currency: 'USD',
    billingInterval: 'monthly',
    stripePriceId: 'price_1QZQZQZQZQZQZQZQZQZQZQZQ',
    videoLimit: 30,
    minutesLimit: 180,
    isActive: true,
  },
  {
    name: 'Pro',
    description: 'Professional plan with all features',
    price: 49.99,
    currency: 'USD',
    billingInterval: 'monthly',
    stripePriceId: 'price_1QZQZQZQZQZQZQZQZQZQZQZQ',
    videoLimit: -1, // Unlimited
    minutesLimit: -1, // Unlimited
    isActive: true,
  },
];
