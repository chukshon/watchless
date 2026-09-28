import { Router } from 'express';
import healthRoutes from './health.routes';

const routes = Router();

// Feature routers mount here later, e.g. routes.use('/summaries', summaryRoutes);
routes.use('/health', healthRoutes);
export default routes;
