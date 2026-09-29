import { env } from '@/config/env';
import jwt, { SignOptions } from 'jsonwebtoken';

const TOKEN_SECRET = env.JWT_SECRET;

const TOKEN_OPTIONS: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
};

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, TOKEN_SECRET, TOKEN_OPTIONS);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, TOKEN_SECRET) as TokenPayload;
};
