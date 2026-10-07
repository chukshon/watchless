import { NextFunction, Request, Response } from 'express';
import { SubscriptionService } from '@/services/subscription.service';
import { HTTPSTATUS } from '@/constants/http-status-code';
import { getErrorResponse } from '@/types/api-response';
import {
  NotFoundException,
  UnauthorizedException,
} from '@/errors/http-errors';

export const requiresSubscription = (tier: 'basic' | 'premium' | 'pro') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedException('Unauthorized');
      }

      // Get user's active subscription
      let subscription;
      try {
        subscription =
          await SubscriptionService.getUserSubscriptionById(userId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          return res.status(HTTPSTATUS.PAYMENT_REQUIRED).json(
            getErrorResponse(
              `This feature requires a ${tier} subscription. Please upgrade to access it.`
            )
          );
        }
        throw error;
      }

      // Check subscription tier
      const planName = subscription.subscriptionPlan.name.toLowerCase();

      // Example tier hierarchy: free -> basic -> premium -> pro
      if (tier === 'basic' && !['basic', 'premium', 'pro'].includes(planName)) {
        return res
          .status(HTTPSTATUS.PAYMENT_REQUIRED)
          .json(
            getErrorResponse(
              'This feature requires at least a basic subscription. Please upgrade.'
            )
          );
      } else if (
        tier === 'premium' &&
        !['premium', 'pro'].includes(planName)
      ) {
        return res
          .status(HTTPSTATUS.PAYMENT_REQUIRED)
          .json(
            getErrorResponse(
              'This feature requires at least a premium subscription. Please upgrade.'
            )
          );
      } else if (tier === 'pro' && planName !== 'pro') {
        return res
          .status(HTTPSTATUS.PAYMENT_REQUIRED)
          .json(
            getErrorResponse(
              'This feature requires a pro subscription. Please upgrade.'
            )
          );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
