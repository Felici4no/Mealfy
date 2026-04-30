import { Router, Request, Response } from 'express';
import { AdminService } from './admin.service';
import { authMiddleware } from '../../shared/middlewares/auth';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const adminRoutes = Router();

adminRoutes.use(authMiddleware, roleGuard(['admin']));

adminRoutes.get('/entities/pending', async (req: Request, res: Response) => {
  const pending = await AdminService.listPendingEntities();
  return res.json(pending);
});

adminRoutes.patch('/entities/:id/approve', async (req: Request, res: Response) => {
  await AdminService.approveEntity(req.params.id as string);
  return res.json({ message: 'Entity approved successfully' });
});

adminRoutes.patch('/entities/:id/reject', async (req: Request, res: Response) => {
  await AdminService.rejectEntity(req.params.id as string);
  return res.json({ message: 'Entity rejected successfully' });
});

export { adminRoutes };
