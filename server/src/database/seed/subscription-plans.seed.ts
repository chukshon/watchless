import { AppDataSource } from '@/database/data-source';
import { SubscriptionPlan } from '@/database/entities/subscription-plan.entity';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription';
import { logger } from '@/lib/logger';

export async function seedSubscriptionPlans() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(SubscriptionPlan);
    const seededNames = SUBSCRIPTION_PLANS.map((plan) => plan.name);

    for (const plan of SUBSCRIPTION_PLANS) {
      const existing = await repo.findOne({ where: { name: plan.name } });

      if (existing) {
        Object.assign(existing, {
          description: plan.description,
          price: plan.price,
          duration: plan.duration,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          stripePriceId: plan.stripePriceId,
          videoLimit: plan.videoLimit,
          minutesLimit: plan.minutesLimit,
          isActive: plan.isActive,
        });
        await repo.save(existing);
        logger.info(`Updated subscription plan: ${plan.name}`);
      } else {
        const created = repo.create({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          duration: plan.duration,
          currency: plan.currency,
          billingInterval: plan.billingInterval,
          stripePriceId: plan.stripePriceId,
          videoLimit: plan.videoLimit,
          minutesLimit: plan.minutesLimit,
          isActive: plan.isActive,
        });
        await repo.save(created);
        logger.info(`Created subscription plan: ${plan.name}`);
      }
    }

    // Soft-remove stale catalog plans (keep FK-safe; don't delete)
    const stalePlans = await repo
      .createQueryBuilder('plan')
      .where('plan.name NOT IN (:...seededNames)', { seededNames })
      .andWhere('plan.isActive = :isActive', { isActive: true })
      .getMany();

    for (const stale of stalePlans) {
      stale.isActive = false;
      await repo.save(stale);
      logger.info(`Deactivated stale subscription plan: ${stale.name}`);
    }
  });

  logger.info('Subscription plans seeded successfully');
}

async function main() {
  try {
    logger.info('Seeding subscription plans...');
    await seedSubscriptionPlans();
    logger.info('Seed complete');
  } catch (error) {
    logger.error('Seed failed', { error });
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  void main();
}
