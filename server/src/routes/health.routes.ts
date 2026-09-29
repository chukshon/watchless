import { Router } from 'express';
import { getSuccessResponse } from '@/lib/api-response';

const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.status(200).json(
    getSuccessResponse(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      'Service is healthy',
    ),
  );
});

export default healthRoutes;
