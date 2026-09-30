import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { authenticateUser } from '@/middleware/authenticate-user.middleware';
import { validateRequest } from '@/middleware/validate-request.middleware';
import {
  downloadAudioSchema,
  getYoutubeVideoInfoSchema,
} from '@/validators/video.validator';

const videoRoutes = Router();

videoRoutes.post(
  '/get-video-info',
  authenticateUser,
  validateRequest({ body: getYoutubeVideoInfoSchema }),
  VideoController.getYoutubeVideoInfo
);

videoRoutes.post(
  '/download-audio',
  authenticateUser,
  validateRequest({ body: downloadAudioSchema }),
  VideoController.downloadAudio
);

export default videoRoutes;
