import { z } from 'zod';

export const createDonationSchema = z.object({
  familyId: z.string(),
  amount: z.number().positive(),
});

export const batchDonationSchema = z.object({
  familyIds: z.array(z.string()),
});
