import { Request, Response } from 'express';
import { DonationsService } from './donations.service';
import { createDonationSchema, batchDonationSchema, regionalDonationSchema } from './donations.validator';

export class DonationsController {
  static async create(req: Request, res: Response) {
    const { familyId } = createDonationSchema.parse(req.body);
    const result = await DonationsService.create(familyId, req.user);
    return res.status(201).json(result);
  }

  static async batch(req: Request, res: Response) {
    const { familyIds } = batchDonationSchema.parse(req.body);
    const results = await DonationsService.createBatch(familyIds, req.user);
    return res.status(201).json(results);
  }

  static async regional(req: Request, res: Response) {
    const { communityId, totalAmount } = regionalDonationSchema.parse(req.body);
    const result = await DonationsService.createRegional(communityId, totalAmount, req.user);
    return res.status(201).json(result);
  }

  static async listMe(req: Request, res: Response) {
    const history = await DonationsService.listMyDonations(req.user.id);
    return res.json(history);
  }
}
