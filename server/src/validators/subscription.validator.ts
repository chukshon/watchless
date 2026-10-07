import { z } from 'zod';

export const createCheckoutSessionBodySchema = z.object({
  subscriptionPlanId: z.string().uuid().optional(),
});

export type CreateCheckoutSessionBodyInputT = z.infer<
  typeof createCheckoutSessionBodySchema
>;
