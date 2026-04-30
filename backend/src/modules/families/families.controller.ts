import { Request, Response } from 'express';
import { FamiliesService } from './families.service';
import { createFamilySchema, updateFamilyStatusSchema } from './families.validator';

export class FamiliesController {
  static async getPublic(req: Request, res: Response) {
    const families = await FamiliesService.getPublicFamilies();
    return res.json(families);
  }

  static async getById(req: Request, res: Response) {
    const family = await FamiliesService.getFamilyById(req.params.id as string);
    return res.json(family);
  }

  static async create(req: Request, res: Response) {
    const data = createFamilySchema.parse(req.body);
    const family = await FamiliesService.createFamily(data, req.user);
    return res.status(201).json(family);
  }

  static async updateStatus(req: Request, res: Response) {
    const data = updateFamilyStatusSchema.parse(req.body);
    const family = await FamiliesService.updateStatus(req.params.id as string, data);
    return res.json(family);
  }
}
