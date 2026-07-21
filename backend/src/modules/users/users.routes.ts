import { Router } from 'express';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { getMe, updateMe, updatePrivacy } from './users.controller';
import { listMyDonations } from '../donations/donations.controller';

// Montado em /me
export const usersRoutes = Router();

usersRoutes.get('/', authGuard, getMe);
usersRoutes.patch('/', authGuard, updateMe);
// GET /me/donations — histórico do doador (sem código)
usersRoutes.patch('/privacy', authGuard, updatePrivacy);
usersRoutes.get('/donations', authGuard, roleGuard('donor'), listMyDonations);
