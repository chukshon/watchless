import { z } from 'zod';

const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const youtubeUrlSchema = z
  .url({ message: 'Invalid URL' })
  .refine((url) => youtubeUrlRegex.test(url), {
    message: 'Invalid YouTube URL',
  });

export const getYoutubeVideoInfoSchema = z.object({
  youtubeUrl: youtubeUrlSchema,
});

export const downloadAudioSchema = z.object({
  youtubeUrl: youtubeUrlSchema,
});

export type GetYoutubeVideoInfoInputT = z.infer<
  typeof getYoutubeVideoInfoSchema
>;

export type DownloadAudioInputT = z.infer<typeof downloadAudioSchema>;
