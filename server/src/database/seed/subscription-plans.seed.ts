import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { AppDataSource } from '../data-source';
import { logger } from '@/lib/logger';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription';

export async function seedSubscriptionPlans() {
  const dataSource = await AppDataSource.initialize();
  const subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);

  const existingPlans = await subscriptionPlanRepository.find();
  if (existingPlans.length > 0) {
    logger.info('Subscription plans already seeded');
    return;
  }
}
