import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import videoRoutes from './video.routes';

const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/auth', authRoutes);
routes.use('/videos', videoRoutes);

export default routes;
