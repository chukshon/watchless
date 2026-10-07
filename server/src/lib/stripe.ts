import Stripe from 'stripe';
import { env } from '@/config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const initializeStripe = () => stripe;
