import path from 'path';

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
}
