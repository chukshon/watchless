import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import bcrypt from 'bcrypt';

import { Video } from '@/database/entities/video.entity';

const SALT_ROUNDS = 12;

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({
    name: 'email_verification_token',
    type: 'text',
    nullable: true,
    select: false,
  })
  emailVerificationToken: string | null;

  @Column({
    name: 'email_verification_token_expires',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  emailVerificationTokenExpires: Date | null;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date | null;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordOnInsert(): Promise<void> {
    this.password = await this.hashPassword(this.password);
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate(): Promise<void> {
    // Avoid re-hashing an already-hashed password on unrelated updates
    if (this.password && !this.isBcryptHash(this.password)) {
      this.password = await this.hashPassword(this.password);
    }
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$/.test(value);
  }
}
