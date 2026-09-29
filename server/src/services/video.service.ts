import path from 'path';
import { mkdir } from 'fs/promises';

import ytdl from 'ytdl-core';
import youtubeDl from 'youtube-dl-exec';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

import { logger } from '@/lib/logger';

import { VideoInfoT, YoutubeDlOutputT } from '@/types/video';

import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/errors/http-errors';

import { AppDataSource } from '@/database/data-source';
import { Video } from '@/database/entities/video.entity';

export class VideoService {
  private static readonly AUDIO_DIR = path.join(process.cwd(), 'temp', 'audio');
  private static readonly videoRepository = AppDataSource.getRepository(Video);

  static async ensureDirectoryExists() {
    await mkdir(VideoService.AUDIO_DIR, { recursive: true });
  }

  static async getVideoInfo(url: string): Promise<VideoInfoT> {
    try {
      // Get Video Info from youtube-dl
      const rawInfo = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: ffmpeg.path,
      });

      const info = rawInfo as YoutubeDlOutputT;

      if (!info.title || !info.uploader || typeof info.duration !== 'number') {
        throw new BadRequestException('Invalid video info');
      }

      // get the best quality thumbnail
      const thumbnail =
        info.thumbnails ||
        (info as any).thumbnails?.[0]?.url ||
        `https://i.ytimg.com/vi/${ytdl.getVideoID(url)}/maxresdefault.jpg`;

      return {
        title: info.title,
        description: info.description || '',
        videoUrl: url,
        duration: info.duration,
        author: info.uploader,
        thumbnail,
      };
    } catch (error) {
      logger.error(`Failed to get video info`, { error });
      if (error instanceof Error) {
        if (error.message.includes('private video')) {
          throw new ForbiddenException('This video is private');
        }

        if (error.message.includes('not available')) {
          throw new NotFoundException('Video not found');
        }
        throw new InternalServerErrorException('Failed to get video info');
      }
      throw new InternalServerErrorException('Failed to get video info');
    }
  }
}
