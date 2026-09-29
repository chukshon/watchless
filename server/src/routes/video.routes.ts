import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { getYoutubeVideoInfoSchema } from '@/validators/video.validator';

const videoRoutes = Router();

videoRoutes.post(
  '/info',
  validateRequest({ body: getYoutubeVideoInfoSchema }),
  VideoController.getYoutubeVideoInfo
);

export default videoRoutes;
