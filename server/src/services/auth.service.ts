import crypto from 'crypto';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { ConflictException } from '@/errors/http-errors';
import { generateToken } from '@/lib/jwt';
import type { AuthUserResponse } from '@/types/user';
import type { RegisterInputT } from '@/validators/auth.validator';

export class AuthService {
  private static readonly userRepository = AppDataSource.getRepository(User);

  static async register(input: RegisterInputT): Promise<AuthUserResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
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

    const jwtToken = generateToken({
      userId: savedUser.id,
      email: savedUser.email,
    });

    return this.toPublicUser(savedUser, jwtToken);
  }

  private static toPublicUser(user: User, token: string): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };
  }
}
