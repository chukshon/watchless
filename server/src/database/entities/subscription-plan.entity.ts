import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSubscription } from '@/database/entities/user-subscription.entity';

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar' })
  billingInterval: 'monthly' | 'yearly';

  @Column({ type: 'varchar' })
  stripePriceId: string;

  @Column({ type: 'integer', default: 0 })
  videoLimit: number;

  @Column({ type: 'integer', default: 0 })
  minutesLimit: number;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.subscriptionPlan
  )
  userSubscriptions: UserSubscription[];
}
