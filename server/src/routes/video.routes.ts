import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { youtubeUrlSchema } from '@/validators/shared.validator';
import { jobIdParamSchema, videoIdParamSchema } from '@/validators/video';

const videoRoutes = Router();

videoRoutes.get('/', authenticateUser, VideoController.getUserVideos);

videoRoutes.get(
  '/:id',
  authenticateUser,
  validateRequest({ params: videoIdParamSchema }),
  VideoController.getVideoById
);

videoRoutes.get('/jobs/running', authenticateUser, VideoController.getAllJobs);

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
  validateRequest({ body: youtubeUrlSchema }),
  VideoController.transcribeVideo
);

videoRoutes.get(
  '/transcribe-video/:jobId/status',
  authenticateUser,
  validateRequest({ params: jobIdParamSchema }),
  VideoController.getTranscriptionStatus
);

export default videoRoutes;
