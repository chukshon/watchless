import Stripe from 'stripe';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { initializeStripe } from '@/lib/stripe';

import { BadRequestException, NotFoundException } from '@/errors/http-errors';
import { SubscriptionStatus } from '@/constants/subscription';
import { AppDataSource } from '@/database/data-source';
import { SubscriptionPlan } from '@/database/entities/subscription-plan.entity';
import { UserSubscription } from '@/database/entities/user-subscription.entity';
import { User } from '@/database/entities/user.entity';

export class SubscriptionService {
  private static readonly stripe = initializeStripe();
  private static readonly userRepository = AppDataSource.getRepository(User);
  private static readonly subscriptionPlanRepository =
    AppDataSource.getRepository(SubscriptionPlan);
  private static readonly userSubscriptionRepository =
    AppDataSource.getRepository(UserSubscription);

  public static async getSubscriptionPlans() {
    return await this.subscriptionPlanRepository.find({
      where: {
        isActive: true,
      },
      order: {
        price: 'ASC',
      },
    });
  }

  public static async getSubscriptionPlanById(SubscriptionPlanId: string) {
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

  public static async getUserSubscriptionById(UserId: string) {
    if (!UserId) {
      logger.error('User ID is required');
      throw new BadRequestException('User ID is required');
    }

    const userSubscription = await this.userSubscriptionRepository.findOne({
      where: {
        user: {
          id: UserId,
        },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['subscriptionPlan'],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!userSubscription) {
      logger.error('User subscription not found');
      throw new NotFoundException('User subscription not found');
    }

    return userSubscription;
  }

  public static async createCheckoutSession(
    UserId: string,
    SubscriptionPlanId: string
  ) {
    const user = await this.userRepository.findOneBy({
      id: UserId,
    });
    if (!user) {
      logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const subscriptionPlan = await this.subscriptionPlanRepository.findOneBy({
      id: SubscriptionPlanId,
    });
    if (!subscriptionPlan) {
      logger.error('Subscription plan not found');
      throw new NotFoundException('Subscription plan not found');
    }

    const activeSubscription = await this.userSubscriptionRepository.findOne({
      where: {
        user: {
          id: UserId,
        },
        status: SubscriptionStatus.ACTIVE,
      },
    });
    if (activeSubscription) {
      logger.error('User already has an active subscription');
      throw new BadRequestException('User already has an active subscription');
    }

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      user.stripeCustomerId = customer.id;
      await this.userRepository.save(user);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      line_items: [
        {
          price: subscriptionPlan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/subscriptions/cancel`,
      metadata: {
        userId: user.id,
        subscriptionPlanId: subscriptionPlan.id,
      },
    });

    return {
      url: session.url,
    };
  }

  public static async handleWebHook(stripeEvent: Stripe.Event) {}

  private static async handleCheckoutSessionCompleted(
    stripeSession: Stripe.Checkout.Session
  ) {
    const { userId, subscriptionPlanId } = stripeSession.metadata || {};

    const subscription = await this.stripe.subscriptions.retrieve(
      stripeSession.subscription as string
    );

    if (userId && subscriptionPlanId) {
      await this.createUserSubscription(
        userId,
        subscriptionPlanId,
        subscription
      );
    }
  }

  private static async handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
    const subscriptionId =
      stripeInvoice.parent?.subscription_details?.subscription;

    if (!subscriptionId || typeof subscriptionId !== 'string') {
      return;
    }

    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;

    const user = await this.userRepository.findOneBy({
      stripeCustomerId: customerId,
    });

    if (user) {
      // Update the subscription period
      const userSubscription = await this.userSubscriptionRepository.findOneBy({
        stripeSubscriptionId: subscriptionId,
      });
      if (userSubscription) {
        userSubscription.currentPeriodStartDate = new Date(
          stripeInvoice.period_start * 1000
        );
        userSubscription.currentPeriodEndDate = new Date(
          stripeInvoice.period_end * 1000
        );

        userSubscription.status = SubscriptionStatus.ACTIVE;

        await this.userSubscriptionRepository.save(userSubscription);
      }
    }
  }

  private static async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription
  ) {
    const stripeCustomerId = stripeSubscription.customer as string;

    const user = await this.userRepository.findOneBy({
      stripeCustomerId,
    });

    if (user) {
      // Update the subscription period
      const userSubscription = await this.userSubscriptionRepository.findOneBy({
        stripeSubscriptionId: stripeSubscription.id,
      });
      if (userSubscription) {
        const item = stripeSubscription.items.data[0];
        userSubscription.status =
          stripeSubscription.status as SubscriptionStatus;
        userSubscription.currentPeriodStartDate = new Date(
          item.current_period_start * 1000
        );
        userSubscription.currentPeriodEndDate = new Date(
          item.current_period_end * 1000
        );

        if (stripeSubscription.cancel_at) {
          userSubscription.cancelAt = new Date(
            stripeSubscription.cancel_at * 1000
          );
        }
        if (stripeSubscription.canceled_at) {
          userSubscription.cancelledAt = new Date(
            stripeSubscription.canceled_at * 1000
          );
        }
        await this.userSubscriptionRepository.save(userSubscription);
      }
    }
  }

  private static async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription
  ) {
    const userSubscription = await this.userSubscriptionRepository.findOneBy({
      stripeSubscriptionId: stripeSubscription.id,
    });
    if (userSubscription) {
      userSubscription.status = SubscriptionStatus.CANCELLED;
      userSubscription.cancelledAt = new Date();
      await this.userSubscriptionRepository.save(userSubscription);
    }
  }

  public static async cancelSubscription(userId: string) {
    const subscription = await this.getUserSubscriptionById(userId);

    if (!subscription) {
      logger.error('No active subscription found');
      throw new NotFoundException('No active subscription found');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
      cancel_at_period_end: true,
    });

    return {
      message: 'Subscription will be canceled at the end of the billing period',
    };
  }

  private static async createUserSubscription(
    userId: string,
    subscriptionPlanId: string,
    stripeSubscription: Stripe.Subscription
  ) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    const subscriptionPlan = await this.subscriptionPlanRepository.findOneBy({
      id: subscriptionPlanId,
    });

    if (!user || !subscriptionPlan) {
      return;
    }

    const userSubscription = new UserSubscription();
    const item = stripeSubscription.items.data[0];
    userSubscription.currentPeriodStartDate = new Date(
      item.current_period_start * 1000
    );
    userSubscription.currentPeriodEndDate = new Date(
      item.current_period_end * 1000
    );
    userSubscription.user = user;
    userSubscription.subscriptionPlan = subscriptionPlan;
    userSubscription.status = SubscriptionStatus.ACTIVE;
    userSubscription.stripeSubscriptionId = stripeSubscription.id;
    userSubscription.currentPeriodStartDate = new Date(
      item.current_period_start * 1000
    );
    userSubscription.currentPeriodEndDate = new Date(
      item.current_period_end * 1000
    );

    await this.userSubscriptionRepository.save(userSubscription);
  }
}
