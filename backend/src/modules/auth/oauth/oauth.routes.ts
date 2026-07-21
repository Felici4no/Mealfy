import { Router } from 'express';
import { loginWithToken, govbrStart, govbrCallback } from './oauth.controller';

/**
 * Rotas de login social, montadas sob /auth (ver app.ts):
 *   POST /auth/oauth/google
 *   POST /auth/oauth/facebook
 *   POST /auth/oauth/apple
 *   GET  /auth/govbr/start
 *   GET  /auth/govbr/callback
 */
export const oauthRoutes = Router();

oauthRoutes.post('/oauth/:provider', loginWithToken);
oauthRoutes.get('/govbr/start', govbrStart);
oauthRoutes.get('/govbr/callback', govbrCallback);
