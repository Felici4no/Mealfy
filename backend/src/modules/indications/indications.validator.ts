import { z } from 'zod';

export const createIndicationSchema = z.object({
  representativeName: z.string().min(3),
  region: z.string().min(3),
  childrenCount: z.number().int().min(0),
  observation: z.string(),
});

export const updateIndicationStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'converted']),
});
