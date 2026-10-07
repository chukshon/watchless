import { Router } from 'express';

import {
  loginSchema,
  registerSchema,
  resendEmailVerificationSchema,
  verifyEmailSchema,
} from '@/validators/auth.validator';

import { validateRequest } from '@/middleware/validate-request.middleware';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { AuthController } from '@/controllers/auth.controller';

const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequest({ body: registerSchema }),
  AuthController.register
);

authRoutes.post(
  '/login',
  validateRequest({ body: loginSchema }),
  AuthController.login
);

authRoutes.get(
  '/verify-email',
  validateRequest({ query: verifyEmailSchema }),
  AuthController.verifyEmail
);

authRoutes.post(
  '/resend-verification',
  validateRequest({ body: resendEmailVerificationSchema }),
  AuthController.resendEmailVerification
);

authRoutes.get('/me', authenticateUser, AuthController.getLoggedInUser);

export default authRoutes;
