import { z } from 'zod';

export const getVideoInfoSchema = z.object({
  url: z.url('A valid video URL is required'),
});

export type GetVideoInfoInputT = z.infer<typeof getVideoInfoSchema>;
