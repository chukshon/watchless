import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { youtubeUrlSchema } from '@/validators/shared.validator';

const videoRoutes = Router();

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
  '/transcribe-audio',
  authenticateUser,
  validateRequest({ body: youtubeUrlSchema }),
  VideoController.transcribeAudio
);

export default videoRoutes;
