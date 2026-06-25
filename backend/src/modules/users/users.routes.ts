import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { getMe } from './users.controller';

// Montado em /me
export const usersRoutes = Router();

usersRoutes.get('/', authGuard, getMe);
// PATCH /me é adicionado na Fase 2B.
