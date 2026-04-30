import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerDonorSchema, registerEntitySchema, loginSchema } from './auth.validator';

export class AuthController {
  static async registerDonor(req: Request, res: Response) {
    const data = registerDonorSchema.parse(req.body);
    const user = await AuthService.registerDonor(data);
    return res.status(201).json(user);
  }

  static async registerEntity(req: Request, res: Response) {
    const data = registerEntitySchema.parse(req.body);
    const user = await AuthService.registerEntity(data);
    return res.status(201).json(user);
  }

  static async login(req: Request, res: Response) {
    const { email } = loginSchema.parse(req.body);
    const user = await AuthService.login(email);
    return res.json({
      token: user.id, // Emitting user ID as mock token
      user
    });
  }

  static async me(req: Request, res: Response) {
    return res.json(req.user);
  }
}
