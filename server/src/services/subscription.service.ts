import Stripe from 'stripe';

import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { BadRequestException, NotFoundException } from '@/errors/http-errors';
import { SubscriptionStatus } from '@/constants/subscription';

import { AppDataSource } from '@/database/data-source';
import { SubscriptionPlan } from '@/database/entities/subscription-plan.entity';
import { UserSubscription } from '@/database/entities/user-subscription.entity';
import { User } from '@/database/entities/user.entity';

export class SubscriptionService {
  private static readonly userRepository = AppDataSource.getRepository(User);
  private static readonly subscriptionPlanRepository =
    AppDataSource.getRepository(SubscriptionPlan);
  private static readonly userSubscriptionRepository =
    AppDataSource.getRepository(UserSubscription);

  private static async getSubscriptionPlans() {
    return await this.subscriptionPlanRepository.find({
      where: {
        isActive: true,
      },
      order: {
        price: 'ASC',
      },
    });
  }

  private static async getSubscriptionPlanById(SubscriptionPlanId: string) {
    if (!SubscriptionPlanId) {
      logger.error('Subscription plan ID is required');
      throw new BadRequestException('Subscription plan ID is required');
    }

    const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
      where: {
        id: SubscriptionPlanId,
      },
    });

    if (!subscriptionPlan) {
      logger.error('Subscription plan not found');
      throw new NotFoundException('Subscription plan not found');
    }

    return subscriptionPlan;
  }
}
