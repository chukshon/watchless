import Stripe from 'stripe';
import { env } from '@/config/env';

export const initializeStripe = () => {
  return new Stripe(env.STRIPE_SECRET_KEY);
};
