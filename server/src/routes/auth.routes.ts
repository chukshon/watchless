import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { registerSchema } from '@/validators/auth.validator';

const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequest({ body: registerSchema }),
  AuthController.register,
);

export default authRoutes;
