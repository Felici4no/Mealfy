import { z } from 'zod';

export const createDonationSchema = z.object({
  familyId: z.string().min(1),
  amount: z.number().int().positive(), // centavos
  provider: z.enum(['ifood', 'ninetynine', 'carrefour']).optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;
