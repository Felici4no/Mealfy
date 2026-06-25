import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { getMe, updateMe } from './users.controller';

// Montado em /me
export const usersRoutes = Router();

usersRoutes.get('/', authGuard, getMe);
usersRoutes.patch('/', authGuard, updateMe);
