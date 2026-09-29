import { z } from 'zod';

const emailSchema = z
  .email({ message: 'Invalid email address' })
  .min(1, { message: 'Email is required' })
  .max(255, { message: 'Email must be less than 255 characters long' });
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(255, { message: 'Password must be less than 255 characters long' });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required' }),
});

export const resendEmailVerificationSchema = z.object({
  email: emailSchema,
});

export type RegisterInputT = z.infer<typeof registerSchema>;
export type LoginInputT = z.infer<typeof loginSchema>;
export type VerifyEmailQueryT = z.infer<typeof verifyEmailSchema>;
export type ResendEmailVerificationInputT = z.infer<
  typeof resendEmailVerificationSchema
>;
