import { Router, Request, Response } from 'express';
import { RankingService } from './ranking.service';

const rankingRoutes = Router();

rankingRoutes.get('/', async (req: Request, res: Response) => {
  const ranking = await RankingService.getGlobalRanking();
  return res.json(ranking);
});

export { rankingRoutes };
