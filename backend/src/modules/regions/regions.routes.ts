import { Router } from 'express';
import { RegionsController } from './regions.controller';

const regionsRoutes = Router();

regionsRoutes.get('/', RegionsController.getRegions);

export { regionsRoutes };
