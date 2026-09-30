import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { logger } from '@/lib/logger';
import {
  gcsBucketName,
  gcsLocation,
  gcsStorageClass,
  storage,
  speechClient,
} from '@/lib/google-cloud';

import {
  BadRequestException,
  InternalServerErrorException,
} from '@/errors/http-errors';

import type { TranscriptionResultT } from '@/types/transcription';
import { unlink } from 'fs/promises';

export class TranscriptionService {
  static async ensureBucketExists() {
    try {
      const [exists] = await storage.bucket(gcsBucketName).exists();

      if (!exists) {
        await storage.createBucket(gcsBucketName, {
          location: gcsLocation,
          storageClass: gcsStorageClass,
        });
        logger.info('Bucket created successfully', {
          bucketName: gcsBucketName,
        });
      }
    } catch (error) {
      logger.error(`error creating bucket: ${gcsBucketName}`, { error });
      throw new InternalServerErrorException('error creating bucket');
    }
  }

  static async uploadToGcs(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    const bucket = storage.bucket(gcsBucketName);

    try {
      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: 'audio/wav',
        },
      });
      const gcsUrl = `gs://${gcsBucketName}/${fileName}`;
      logger.info(`Audio uploaded to GCS successfully to ${gcsUrl}`, {
        gcsUrl,
      });
      return gcsUrl;
    } catch (error) {
      logger.error(`error uploading to GCS: ${fileName}`, { error });
      throw new InternalServerErrorException('error uploading to GCS');
    }
  }

  static async deleteFromGcs(gcsUrl: string): Promise<void> {
    try {
      const fileName = gcsUrl.split('/').pop();
      if (!fileName) return;

      const file = storage.bucket(gcsBucketName).file(fileName);
      const [exists] = await file.exists();

      if (exists) {
        await file.delete();
        logger.info(`Audio deleted from GCS successfully from ${gcsUrl}`);
      }
    } catch (error) {
      logger.error(`error deleting from GCS: ${gcsUrl}`, { error });
      throw new InternalServerErrorException('error deleting from GCS');
    }
  }

  static async convertToWav(inputPath: string): Promise<string> {
    const outputPath = path.join(
      path.dirname(inputPath),
      `${path.basename(inputPath, path.extname(inputPath))}.wav`
    );

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioFilters([
          'aresample=resampler=soxr', // High quality resampling,
          'lowpass=f=3000', //Focus on speech frequencies,
          'highpass=f=50', // Remove Low frequency noise,
          'afftdn=nf=-25', // Noise reduction,
          'loudnorm=I=-16:LRA=-11:TP=-1.5', // Normalize audio levels,
          'aformat=channel_layouts=mono', // Ensure mono output,
        ])
        .on('end', () => {
          logger.info(`Audio converted to WAV successfully to ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error(`error converting to WAV: ${inputPath}`, { err });
          reject(
            new InternalServerErrorException('Failed to convert audio to WAV')
          );
        });
    });
  }

  static async detectContentType(
    audioPath: string
  ): Promise<'speech' | 'music'> {
    const analysisPath = path.join(
      path.dirname(audioPath),
      `${path.basename(audioPath, path.extname(audioPath))}_analyze.wav`
    );

    return new Promise((resolve, reject) => {
      let musicScore = 0;
      let totalSamples = 0;

      ffmpeg(audioPath)
        .toFormat('wav')
        .audioFrequency(16000)
        .audioFilter(['silencedetect=n=-50dB:d=0.5', 'volumedetect'])
        .save(analysisPath)
        .on('stderr', (stderrLine) => {
          logger.info(`FFMPEG analysis: ${stderrLine}`);

          if (stderrLine.includes('silence_duration')) {
            musicScore += 1; //Less Silence = More Music
          }

          if (stderrLine.includes('max_volume')) {
            const match = stderrLine.match(/max_volume:\s*([-\d.]+)/);

            if (match) {
              const maxVolume = parseFloat(match[1]);
              if (maxVolume > -5) {
                musicScore += 1; //More Volume = More Music
              }
            }
          }
          totalSamples += 1;
        })
        .on('end', async () => {
          await unlink(analysisPath).catch(() => {});
          const ratio = totalSamples > 0 ? musicScore / totalSamples : 0;
          logger.info(`Music detection ratio: ${ratio}`);
          resolve(ratio > 0.5 ? 'music' : 'speech');
        })
        .on('error', async (err) => {
          await unlink(analysisPath).catch(() => {});
          logger.error(`error detecting content type: ${audioPath}`, { err });
          reject(
            new InternalServerErrorException('Failed to detect content type')
          );
        });
    });
  }
}
