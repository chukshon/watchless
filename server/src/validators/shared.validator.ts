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

export type YoutubeUrlInputT = z.infer<typeof youtubeUrlSchema>;
