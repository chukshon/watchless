import z from 'zod';

export const idSchema = z
  .string()
  .uuid('ID must be a valid UUID')
  .min(1, 'ID is required');

export const videoIdParamSchema = z.object({
  videoId: idSchema,
});

export const jobIdParamSchema = z.object({
  jobId: idSchema,
});

export type JobIdParamInputT = z.infer<typeof jobIdParamSchema>;
export type VideoIdParamInputT = z.infer<typeof videoIdParamSchema>;
