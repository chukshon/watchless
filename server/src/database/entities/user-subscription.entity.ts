import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SubscriptionStatus } from '@/constants/subscription';
import { User } from '@/database/entities/user.entity';
import { SubscriptionPlan } from '@/database/entities/subscription-plan.entity';

@Entity({ name: 'user_subscriptions' })
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INCOMPLETE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodStartDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  currentPeriodEndDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  videoUsed: number;

  @Column({ type: 'integer', default: 0 })
  minutesUsed: number;

  @Column({ type: 'integer', default: 0 })
  videoLimit: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userSubscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => SubscriptionPlan,
    (subscriptionPlan) => subscriptionPlan.userSubscriptions
  )
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan;
}
