import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares/auth';

const authRoutes = Router();

authRoutes.post('/register/donor', AuthController.registerDonor);
authRoutes.post('/register/entity', AuthController.registerEntity);
authRoutes.post('/login/mock', AuthController.login);
authRoutes.get('/me', authMiddleware, AuthController.me);

export { authRoutes };
