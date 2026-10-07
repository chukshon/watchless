import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { idParamSchema, youtubeUrlSchema } from '@/validators/shared.validator';

const videoRoutes = Router();

videoRoutes.get('/', authenticateUser, VideoController.getUserVideos);

videoRoutes.get(
  '/:id',
  authenticateUser,
  validateRequest({ params: idParamSchema }),
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
  '/transcribe-video/:id/status',
  authenticateUser,
  validateRequest({ params: idParamSchema }),
  VideoController.getTranscriptionStatus
);

export default videoRoutes;
