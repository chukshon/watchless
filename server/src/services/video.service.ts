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

  static async getUserVideos(userId: string): Promise<Video[]> {
    const videos = await this.videoRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['transcription', 'analysis'],
      order: {
        createdAt: 'DESC',
      },
    });
    return videos;
  }

  static async getVideoById(
    videoId: string,
    userId: string
  ): Promise<Video | null> {
    const video = await this.videoRepository.findOne({
      where: {
        id: videoId,
        user: {
          id: userId,
        },
      },
      relations: ['transcription', 'analysis'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }
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

  static transformVideo(video: Video) {
    return {
      id: video?.id,
      url: video?.url,
      title: video?.title,
      description: video?.description,
      duration: video?.duration,
      author: video?.author,
      thumbnail: video?.thumbnail,
      status: video?.status,
      createdAt: video?.createdAt,
      updatedAt: video?.updatedAt,
      transcription: video?.transcription
        ? {
            text: video?.transcription?.text,
            confidence: video?.transcription?.confidence,
            isMusic: video?.transcription?.isMusic,
            createdAt: video?.transcription?.createdAt,
          }
        : null,
      analysis: video?.analysis
        ? {
            summary: video?.analysis?.summary,
            keyPoints: video?.analysis?.keyPoints,
            sentiments: video?.analysis?.sentiment,
            topics: video?.analysis?.topics,
            suggestedTags: video?.analysis?.suggestedTags,
            updatedAt: video?.analysis?.updatedAt,
          }
        : null,
    };
  }
}
