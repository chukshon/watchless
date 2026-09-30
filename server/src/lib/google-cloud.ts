import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { env } from '@/config/env';

export const speechClient = new SpeechClient();
export const storage = new Storage();
export const gcsBucketName = env.GCS_BUCKET_NAME;
export const gcsLocation = env.GCS_LOCATION;
export const gcsStorageClass = env.GCS_STORAGE_CLASS;
