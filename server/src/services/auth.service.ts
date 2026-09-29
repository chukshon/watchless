import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { generateToken } from '@/lib/jwt';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@/errors/http-errors';

import type { AuthUserResponse } from '@/types/user';
import type { LoginInputT, RegisterInputT } from '@/validators/auth.validator';

import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { EmailService } from '@/services/email.service';

export class AuthService {
  private static readonly userRepository = AppDataSource.getRepository(User);

  static async register(input: RegisterInputT): Promise<AuthUserResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      logger.error(`Email already in use: ${input.email}`);
      throw new ConflictException('Invalid Credentials');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresIn = new Date();
    verificationTokenExpiresIn.setHours(
      verificationTokenExpiresIn.getHours() + 24
    );

    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      password: input.password,
      name: input.name,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpiresIn,
    });

    const savedUser = await this.userRepository.save(user);

    // TODO: Send email verification email
    await EmailService.sendEmailVerification(
      savedUser.email,
      verificationToken
    );

    const jwtToken = generateToken({
      userId: savedUser.id,
      email: savedUser.email,
    });

    return this.buildAuthResponse(savedUser, jwtToken);
  }

  static async login(input: LoginInputT): Promise<AuthUserResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: input.email.toLowerCase() })
      .getOne();

    if (!user) {
      logger.error(`User not found: ${input.email}`);
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      logger.error(`Invalid password for user: ${input.email}`);
      throw new UnauthorizedException('Invalid Credentials');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    return this.buildAuthResponse(user, jwtToken);
  }

  static async verifyEmail(token: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.emailVerificationToken')
      .addSelect('user.emailVerificationTokenExpires')
      .where('user.emailVerificationToken = :token', { token })
      .getOne();

    if (!user) {
      logger.error(`Invalid verification token: ${token}`);
      throw new NotFoundException('Invalid verification token');
    }

    if (
      !user.emailVerificationTokenExpires ||
      user.emailVerificationTokenExpires < new Date()
    ) {
      logger.error(`Verification token expired: ${token}`);
      throw new BadRequestException('Verification token expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;

    await this.userRepository.save(user);

    await EmailService.sendWelcomeEmail(user.email, user.name);

    return {
      message: 'Email verified successfully',
    };
  }

  static async resendEmailVerification(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logger.error(`User not found: ${email}`);
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      logger.error(`Email already verified: ${email}`);
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresIn = new Date();
    verificationTokenExpiresIn.setHours(
      verificationTokenExpiresIn.getHours() + 24,
    );

    // Use update() so select:false columns (e.g. password) aren't wiped on save
    await this.userRepository.update(
      { id: user.id },
      {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpiresIn,
      },
    );

    await EmailService.sendEmailVerification(user.email, verificationToken);

    return {
      message: 'Verification email sent',
    };
  }

  private static buildAuthResponse(
    user: User,
    token: string
  ): AuthUserResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }
}
