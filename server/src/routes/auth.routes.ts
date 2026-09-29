import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validate-request.middleware';
import {
  loginSchema,
  registerSchema,
  resendEmailVerificationSchema,
  verifyEmailSchema,
} from '@/validators/auth.validator';

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

export default authRoutes;
