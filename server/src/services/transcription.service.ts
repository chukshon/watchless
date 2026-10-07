import path from 'path';
import { unlink } from 'fs/promises';

import ffmpeg from 'fluent-ffmpeg';
import { protos } from '@google-cloud/speech';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

import { env } from '@/config/env';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/errors/http-errors';

import {
  gcsBucketName,
  gcsLocation,
  gcsStorageClass,
  storage,
  speechClient,
} from '@/lib/google-cloud';
import { logger } from '@/lib/logger';
import type { TranscriptionResultT } from '@/types/transcription';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
        .outputOptions(['-acodec pcm_s16le', '-ac 1', '-ar 16000'])
        .save(outputPath)
        .on('start', (commandLine) => {
          logger.info(`FFMPEG conversion started: ${commandLine}`);
        })
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

  static async transcribe(audioPath: string): Promise<TranscriptionResultT> {
    let wavepath: string | undefined;
    let gcsUrl: string | undefined;

    try {
      if (!audioPath) {
        throw new BadRequestException('Audio path is required');
      }

      // Ensure the bucket exists
      await this.ensureBucketExists();
      // First convert the file to wav if it's not already in wav format
      wavepath = await this.convertToWav(audioPath);
      logger.info(`Audio converted to WAV successfully to ${wavepath}`);

      // Detect the content type of the audio(i.e music or speech)
      const contentType = await this.detectContentType(wavepath);
      logger.info(`Content type detected: ${contentType}`);

      if (contentType === 'music') {
        logger.info(`Audio is music, skipping transcription`);
        await unlink(wavepath).catch(() => {});
        return {
          text: '[MUSIC CONTENT DETECTED]',
          confidence: 1.0,
          isMusic: true,
        };
      }

      // Upload the audio to google cloud storage
      gcsUrl = await this.uploadToGcs(wavepath);
      logger.info(`Audio uploaded to GCS successfully to ${gcsUrl}`);

      // configure transcription request
      const transcriptionRequest: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest =
        {
          audio: {
            uri: gcsUrl,
          },
          config: {
            encoding:
              protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding
                .LINEAR16,
            sampleRateHertz: 16000,
            languageCode: env.GCS_LANGUAGE_CODE,
            model: 'default',
            enableAutomaticPunctuation: true,
            useEnhanced: true,
            metadata: {
              interactionType: 'DICTATION',
              microphoneDistance: 'NEARFIELD',
              recordingDeviceType: 'SMARTPHONE',
            },

            enableWordTimeOffsets: true,
            enableWordConfidence: true,
            maxAlternatives: 1,
            profanityFilter: true,
            adaptation: {
              phraseSetReferences: [],
              customClasses: [],
            },
            audioChannelCount: 1,
            enableSeparateRecognitionPerChannel: false,
            speechContexts: [
              {
                phrases: ['video', 'youtube', 'subscribe', 'like', 'comment'],
                boost: 20,
              },
            ],
          },
        };
      const [operation] =
        await speechClient.longRunningRecognize(transcriptionRequest);
      const [response] = await operation.promise();
      logger.info(`Transcription response: ${JSON.stringify(response)}`);

      //   clean up files
      await Promise.all([
        wavepath ? unlink(wavepath).catch(() => {}) : Promise.resolve(),
        gcsUrl ? this.deleteFromGcs(gcsUrl) : Promise.resolve(),
      ]);

      if (!response.results || response.results.length === 0) {
        throw new BadRequestException('No transcription results found');
      }

      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || '')
        .join(' ');

      const confidence =
        response.results.reduce(
          (sum, result) => sum + (result.alternatives?.[0]?.confidence || 0),
          0
        ) / response.results.length;

      if (!transcription.trim()) {
        throw new BadRequestException('No transcription results found');
      }

      return {
        text: transcription,
        confidence: confidence,
        isMusic: false,
      };
    } catch (error) {
      logger.error(`error transcribing: ${audioPath}`, { error });
      throw new InternalServerErrorException('Failed to transcribe audio');
    }
  }
}
