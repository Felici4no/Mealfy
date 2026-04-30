import { Request, Response } from 'express';
import { IndicationsService } from './indications.service';
import { createIndicationSchema, updateIndicationStatusSchema } from './indications.validator';

export class IndicationsController {
  static async create(req: Request, res: Response) {
    const data = createIndicationSchema.parse(req.body);
    const indication = await IndicationsService.create(data, req.user.id);
    return res.status(201).json(indication);
  }

  static async list(req: Request, res: Response) {
    const indications = await IndicationsService.listAll();
    return res.json(indications);
  }

  static async convert(req: Request, res: Response) {
    const family = await IndicationsService.convertToFamily(req.params.id, req.user);
    return res.status(201).json(family);
  }

  static async updateStatus(req: Request, res: Response) {
    const { status } = updateIndicationStatusSchema.parse(req.body);
    const indication = await IndicationsService.updateStatus(req.params.id, status);
    return res.json(indication);
  }
}
