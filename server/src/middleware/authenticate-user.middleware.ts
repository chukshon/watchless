import { Request, Response, NextFunction, type RequestHandler } from 'express';
import { UnauthorizedException } from '@/errors/http-errors';
import { TokenPayload, verifyToken } from '@/lib/jwt';

import { logger } from '@/lib/logger';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';

const parseAuthorizationHeader = (value: string | undefined): string => {
  if (!value) {
    throw new UnauthorizedException('Unauthorized');
  }

  const [scheme, token] = value.split(' ');

  if (scheme.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedException('Unauthorized');
  }

  return token;
};

const validateAccessTokenPayload = (payload: TokenPayload): TokenPayload => {
  if (!payload.userId || !payload.email) {
    logger.error('Invalid access token payload', { payload });
    throw new UnauthorizedException('Unauthorized');
  }
  return {
    userId: payload.userId,
    email: payload.email,
  };
};

async function authenticateApiKey(
  userId: string,
  req: Request,
  _res: Response
) {
  const existingUser = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!existingUser) {
    logger.error('User not found', { userId });
    throw new UnauthorizedException('User not found');
  }
  req.user = { userId: existingUser.id, email: existingUser.email };

  return existingUser;
}

export const authenticateUser: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = parseAuthorizationHeader(req.headers.authorization).trim();

    if (token.startsWith('xi_')) {
      await authenticateApiKey(token, req, _res);
      return next();
    }

    const payload = verifyToken(token);
    const user = validateAccessTokenPayload(payload);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      next(error);
      return;
    }
    next(new UnauthorizedException('Unauthorized'));
  }
};
