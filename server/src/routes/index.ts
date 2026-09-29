import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';

const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/auth', authRoutes);

export default routes;
