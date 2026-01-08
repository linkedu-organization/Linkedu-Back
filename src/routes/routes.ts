import { Router } from 'express';

import { recrutadorRoutes } from './recrutador.routes';

export const routes = Router();

routes.use('/recrutador', recrutadorRoutes);
