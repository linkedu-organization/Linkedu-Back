import { Router } from 'express';

import { recrutadorRoutes } from './recrutador.routes';
import { candidatoRoutes } from './candidato.routes';
import { perfilRoutes } from './perfil.routes';
import { vagaRoutes } from './vaga.routes';

export const routes = Router();

routes.use('/perfil', perfilRoutes);
routes.use('/recrutadores', recrutadorRoutes);
routes.use('/candidatos', candidatoRoutes);
routes.use('/vagas', vagaRoutes);
