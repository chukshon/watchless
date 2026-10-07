import { z } from 'zod';

const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const youtubeUrlSchema = z.object({
  youtubeUrl: z
    .url({ message: 'Invalid URL' })
    .refine((url) => youtubeUrlRegex.test(url), {
      message: 'Invalid YouTube URL',
    }),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID').min(1, 'ID is required'),
});

export type YoutubeUrlInputT = z.infer<typeof youtubeUrlSchema>;
export type IdParamInputT = z.infer<typeof idParamSchema>;
