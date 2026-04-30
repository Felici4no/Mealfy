import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middlewares/errorHandler';

import { authRoutes } from './modules/auth/auth.routes';
import { familiesRoutes } from './modules/families/families.routes';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/families', familiesRoutes);

app.use(errorHandler);

export { app };
