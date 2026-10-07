import { env } from '@/config/env';
import { SubscriptionPlanT } from '@/types/subscription';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  TRIAL = 'trial',
}

export enum SubscriptionWebhookEvent {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  INVOICE_PAID = 'invoice.paid',
  SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
}

export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  PRO = 'pro',
}

export enum SubscriptionBillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export const getSubscriptionPlans = (): SubscriptionPlanT[] => [
  {
    name: 'Basic',
    description: 'Basic subscription plan',
    price: 9.99,
    duration: 30,
    currency: 'USD',
    billingInterval: SubscriptionBillingInterval.MONTHLY,
    stripePriceId: env.STRIPE_PRICE_BASIC,
    videoLimit: 10,
    minutesLimit: 60,
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Premium plan with more features',
    price: 19.99,
    duration: 30,
    currency: 'USD',
    billingInterval: SubscriptionBillingInterval.MONTHLY,
    stripePriceId: env.STRIPE_PRICE_PREMIUM,
    videoLimit: 30,
    minutesLimit: 180,
    isActive: true,
  },
  {
    name: 'Pro',
    description: 'Professional plan with all features',
    price: 49.99,
    duration: 30,
    currency: 'USD',
    billingInterval: SubscriptionBillingInterval.MONTHLY,
    stripePriceId: env.STRIPE_PRICE_PRO,
    videoLimit: -1, // Unlimited
    minutesLimit: -1, // Unlimited
    isActive: true,
  },
];
