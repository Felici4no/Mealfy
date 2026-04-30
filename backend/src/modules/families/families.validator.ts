import { z } from 'zod';

export const createFamilySchema = z.object({
  representativeName: z.string().min(3),
  neighborhood: z.string().min(3),
  city: z.string(),
  state: z.string().length(2),
  shortAddress: z.string(),
  description: z.string(),
  childrenCount: z.number().int().min(1),
  mainNeed: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const updateFamilyStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  supportStatus: z.enum(['needs_help', 'fed', 'rejected', 'suspended']).optional(),
});
