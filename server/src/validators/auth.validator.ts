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

export type RegisterInputT = z.infer<typeof registerSchema>;
