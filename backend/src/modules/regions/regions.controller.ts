import { Request, Response } from 'express';
import { RegionsService } from './regions.service';

export class RegionsController {
  static async getRegions(req: Request, res: Response) {
    const regions = await RegionsService.getRegions();
    return res.json(regions);
  }
}
