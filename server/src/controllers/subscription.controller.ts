import type Stripe from 'stripe';

import { env } from '@/config/env';
import { HTTPSTATUS } from '@/constants/http-status-code';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@/errors/http-errors';
import { stripe } from '@/lib/stripe';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { SubscriptionService } from '@/services/subscription.service';
import { getSuccessResponse } from '@/types/api-response';

export class SubscriptionController {
  static getSubscriptionPlans = asyncHandler(async (_req, res) => {
    const subscriptionPlans = await SubscriptionService.getSubscriptionPlans();

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(
          subscriptionPlans,
          'Subscription plans fetched successfully'
        )
      );
  });
  static getUserSubscription = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;

    try {
      const subscription = await SubscriptionService.getUserSubscriptionById(
        userId!
      );

      res.status(HTTPSTATUS.OK).json(
        getSuccessResponse(
          {
            isSubscribed: true,
            subscription,
          },
          'User subscription fetched successfully'
        )
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        res
          .status(HTTPSTATUS.OK)
          .json(
            getSuccessResponse(
              { isSubscribed: false },
              'User has no active subscription'
            )
          );
        return;
      }
      throw error;
    }
  });
  static createCheckoutSession = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const { planId } = req.body as { planId?: string };

    if (!planId) {
      throw new BadRequestException('Plan ID is required');
    }

    const session = await SubscriptionService.createCheckoutSession(
      userId!,
      planId
    );

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(session, 'Checkout session created successfully')
      );
  });
}
