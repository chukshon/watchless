import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { ConflictException } from '@/errors/http-errors';
import crypto from 'crypto';
import { generateToken } from '@/lib/jwt';

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  token: string;
};

export class AuthService {
  private static readonly userRepository = AppDataSource.getRepository(User);

  static async register(
    email: string,
    password: string,
    name?: string
  ): Promise<PublicUser> {
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresIn = new Date();
    verificationTokenExpiresIn.setHours(
      verificationTokenExpiresIn.getHours() + 24
    );

    const user = this.userRepository.create({
      email: email.toLowerCase(),
      password: password,
      name: name,
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

  private static toPublicUser(user: User, token: string): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: token,
    };
  }
}
