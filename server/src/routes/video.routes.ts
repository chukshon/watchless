import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { validateRequest } from '@/middleware/validate-request.middleware';
import { getVideoInfoSchema } from '@/validators/video.validator';

const videoRoutes = Router();

videoRoutes.post(
  '/info',
  validateRequest({ body: getVideoInfoSchema }),
  VideoController.getVideoInfo,
);

export default videoRoutes;
