import Queue from 'bull';
import { unlink } from 'fs/promises';

import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { VideoStatus } from '@/constants/video';

import { AppDataSource } from '@/database/data-source';
import { Transcription } from '@/database/entities/transcription.entity';
import { Video } from '@/database/entities/video.entity';
import { Analysis } from '@/database/entities/analysis.entity';
import { User } from '@/database/entities/user.entity';

import { TranscriptionService } from '@/services/transcription.service';
import { VideoService } from '@/services/video.service';
import { AiService } from '@/services/ai.service';

export class JobsService {
  private static transcriptionQueue: Queue.Queue;
  private static readonly videoRepository = AppDataSource.getRepository(Video);
  private static readonly transcriptionRepository =
    AppDataSource.getRepository(Transcription);
  private static readonly analysisRepository =
    AppDataSource.getRepository(Analysis);
  private static readonly userRepository = AppDataSource.getRepository(User);

  static async initialize() {
    this.transcriptionQueue = new Queue('transcription', {
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // 24 hours
          count: 100,
        },
        removeOnFail: {
          age: 24 * 3600, // 24 hours
        },
      },
    });
    await this.setupQueueHandlers();
  }

  static async setupQueueHandlers() {
    this.transcriptionQueue.process(async (job) => {
      const { url, userId } = job.data;
      let audioPath: string | undefined;
      let video: Video | null = null;

      try {
        // Create video or update existing video
        video = await this.videoRepository.findOne({
          where: {
            url,
          },
        });
        if (!video) {
          video = new Video();
          video.url = url;
          video.user = { id: userId } as User;
          video.status = VideoStatus.PROCESSING;
        }
        job.progress(10);

        // Get video info if not already present
        const videoInfo =
          job.data.videoInfo || (await VideoService.getYoutubeVideoInfo(url));

        //   update video with info
        Object.assign(video, {
          title: videoInfo.title,
          description: videoInfo.description,
          duration: videoInfo.duration,
          author: videoInfo.author,
          thumbnail: videoInfo.thumbnail,
        });

        await this.videoRepository.save(video);
        job.progress(20);

        // download audio
        audioPath = await VideoService.downloadAudio(url);
        job.progress(40);

        // transcribe audio
        const transcriptionResult =
          await TranscriptionService.transcribe(audioPath);
        job.progress(40);

        // Check if transcription already exists and update or create new one
        let transcription = await this.transcriptionRepository.findOne({
          where: {
            video: { id: video.id },
          },
        });

        if (transcription) {
          // Update existing transcription
          Object.assign(transcription, {
            text: transcriptionResult.text,
            confidence: transcriptionResult.confidence,
            isMusic: transcriptionResult.isMusic || false,
            audioPath: audioPath,
          });
        } else {
          transcription = new Transcription();
          Object.assign(transcription, {
            text: transcriptionResult.text,
            confidence: transcriptionResult.confidence,
            isMusic: transcriptionResult.isMusic || false,
            audioPath: audioPath,
            video: video,
          });
        }
        await this.transcriptionRepository.save(transcription);

        // Clean up audio file
        if (audioPath) {
          await unlink(audioPath).catch(() => {});
        }
        job.progress(70);

        // Dont proceed if it's a music video
        if (transcriptionResult.isMusic) {
          video.status = VideoStatus.COMPLETED;
          await this.videoRepository.save(video);
          return {
            status: 'completed',
            videoInfo,
            transcription: transcriptionResult,
          };
        }

        // Analyze transcription with AI
        const aiAnalysisResult = await AiService.analyzeTranscription(
          transcriptionResult.text,
          videoInfo
        );

        // Check if analysis already exists and update or create new one
        let analysis = await this.analysisRepository.findOne({
          where: {
            video: { id: video.id },
          },
        });
        if (analysis) {
          // Update existing analysis
          Object.assign(analysis, aiAnalysisResult);
        } else {
          analysis = new Analysis();
          Object.assign(analysis, aiAnalysisResult);
          analysis.video = video;
        }
        await this.analysisRepository.save(analysis);

        video.status = VideoStatus.COMPLETED;
        await this.videoRepository.save(video);

        job.progress(100);

        return {
          transcription: transcriptionResult,
          analysis: aiAnalysisResult,
          status: VideoStatus.COMPLETED,
          videoInfo,
        };
      } catch (error) {
        // Clean up audio file
        if (audioPath) {
          await unlink(audioPath).catch(() => {});
        }

        // Update video status to failed
        if (video) {
          video.status = VideoStatus.FAILED;
          await this.videoRepository.save(video);
        }

        logger.error('Error processing transcription job', { error });

        if (
          error instanceof Error &&
          (error.message.includes('No speech detected') ||
            error.message.includes('This video is private') ||
            error.message.includes('This video is no longer available'))
        ) {
          return {
            error: error.message,
            status: VideoStatus.FAILED,
            final: true,
          };
        }

        throw error;
      }
    });

    this.transcriptionQueue.on('completed', async (job, result) => {
      try {
        const user = await this.userRepository.findOne({
          where: { id: job.data.userId },
        });

        if (user && result.videoInfo) {
          // TODO: Send Job completion email
        }
      } catch (error) {
        logger.error('Error sending job completion email', {
          error,
        });
      }
    });

    this.transcriptionQueue.on('failed', async (job, error) => {
      logger.error('Job Transcription failed', {
        error,
        jobId: job.id,
        jobData: job.data,
      });
    });

    this.transcriptionQueue.on('error', (error) => {
      logger.error('Error processing transcription job', { error });
    });

    // Clean up stuck jobs
    this.transcriptionQueue.clean(24 * 3600 * 1000, 'delayed');
    this.transcriptionQueue.clean(24 * 3600 * 1000, 'wait');
    this.transcriptionQueue.clean(24 * 3600 * 1000, 'active');
  }

  static async addTranscriptionJob(url: string, videoInfo: any, user: any) {
    let video = await this.videoRepository.findOne({
      where: {
        url,
      },
    });

    if (!video) {
      video = new Video();
      video.url = url;
      video.user = user;
      video.status = VideoStatus.PENDING;
      if (videoInfo) {
        Object.assign(video, {
          title: videoInfo.title,
          description: videoInfo.description,
          duration: videoInfo.duration,
          author: videoInfo.author,
          thumbnail: videoInfo.thumbnailUrl || videoInfo.thumbnail,
        });
      }
      await this.videoRepository.save(video);
    }

    const job = await this.transcriptionQueue.add({
      url,
      userId: user.id,
      videoInfo,
    });
    return {
      jobId: job.id,
    };
  }
}
