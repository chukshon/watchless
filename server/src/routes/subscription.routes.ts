import { Router } from 'express';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { SubscriptionController } from '@/controllers/subscription.controller';
import { createCheckoutSessionBodySchema } from '@/validators/subscription.validator';
import { requiresSubscription } from '@/middleware/subscription.middleware';

const subscriptionRoutes = Router();

subscriptionRoutes.post('/webhook', SubscriptionController.handleWebhook);

subscriptionRoutes.get(
  '/subscription-plans',
  SubscriptionController.getSubscriptionPlans
);
subscriptionRoutes.get(
  '/user-subscription',
  authenticateUser,
  SubscriptionController.getUserSubscription
);
subscriptionRoutes.post(
  '/create-checkout-session',
  authenticateUser,
  validateRequest({ body: createCheckoutSessionBodySchema }),
  SubscriptionController.createCheckoutSession
);
subscriptionRoutes.post(
  '/cancel-subscription',
  authenticateUser,
  SubscriptionController.cancelSubscription
);

export default subscriptionRoutes;
