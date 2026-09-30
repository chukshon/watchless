import path from 'path';
import { mkdir } from 'fs/promises';

import ytdl from 'ytdl-core';
import youtubeDl from 'youtube-dl-exec';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

import { logger } from '@/lib/logger';

import { YoutubeVideoInfoT, YoutubeDlOutputT } from '@/types/video';

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

  static async getYoutubeVideoInfo(
    youtubeUrl: string
  ): Promise<YoutubeVideoInfoT> {
    try {
      // Get youtube Video Info from youtube-dl
      const rawInfo = await youtubeDl(youtubeUrl, {
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
        info.thumbnail ||
        (info as any).thumbnails?.[0]?.url ||
        `https://i.ytimg.com/vi/${ytdl.getVideoID(youtubeUrl)}/maxresdefault.jpg`;

      return {
        title: info.title,
        description: info.description || '',
        videoUrl: youtubeUrl,
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

  static async downloadAudio(youtubeUrl: string): Promise<string> {
    try {
      await this.ensureDirectoryExists();

      // extract video from url
      const videoId = ytdl.getVideoID(youtubeUrl);
      const audioPath = path.join(this.AUDIO_DIR, `${videoId}.mp3`);

      // download audio
      await youtubeDl(youtubeUrl, {
        output: audioPath,
        audioFormat: 'mp3',
        audioQuality: 0,
        extractAudio: true,
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: ffmpeg.path,
      });

      const fileStats = await import('fs/promises').then((fs) =>
        fs.stat(audioPath)
      );

      if (fileStats.size === 0) {
        throw new InternalServerErrorException('Failed to download audio');
      }

      return audioPath;
    } catch (error) {
      logger.error('Failed to download audio', { error });
      if (error instanceof Error) {
        if (error.message.includes('ffmpeg')) {
          throw new ForbiddenException('Failed to download audio');
        }
        throw new InternalServerErrorException('Failed to download audio');
      }
      throw new InternalServerErrorException('Failed to download audio');
    }
  }
}
