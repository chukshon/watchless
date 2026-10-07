import { Router } from 'express';

import { SubscriptionTier } from '@/constants/subscription';
import { jobIdParamSchema, videoIdParamSchema } from '@/validators/video';
import { youtubeUrlSchema } from '@/validators/shared.validator';

import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { requiresSubscription } from '@/middleware/subscription.middleware';
import { VideoController } from '@/controllers/video.controller';

const videoRoutes = Router();

videoRoutes.get('/', authenticateUser, VideoController.getUserVideos);

videoRoutes.get(
  '/:id',
  authenticateUser,
  validateRequest({ params: videoIdParamSchema }),
  VideoController.getVideoById
);

videoRoutes.post(
  '/get-video-info',
  authenticateUser,
  validateRequest({ body: youtubeUrlSchema }),
  VideoController.getYoutubeVideoInfo
);

videoRoutes.post(
  '/download-audio',
  authenticateUser,
  validateRequest({ body: youtubeUrlSchema }),
  VideoController.downloadAudio
);

videoRoutes.post(
  '/transcribe-video',
  authenticateUser,
  requiresSubscription(SubscriptionTier.BASIC),
  validateRequest({ body: youtubeUrlSchema }),
  VideoController.transcribeVideo
);

videoRoutes.get(
  '/transcribe-video/:jobId/status',
  authenticateUser,
  validateRequest({ params: jobIdParamSchema }),
  VideoController.getTranscriptionStatus
);

videoRoutes.get('/jobs/running', authenticateUser, VideoController.getAllJobs);

export default videoRoutes;
