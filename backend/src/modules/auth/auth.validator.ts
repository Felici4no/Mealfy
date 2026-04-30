import { z } from 'zod';

export const registerDonorSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6), // Password logic is mock but schema exists
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string().min(11),
});

export const registerEntitySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  cnpj: z.string().min(14),
  region: z.string().min(3),
  type: z.enum(['ONG', 'igreja', 'escola', 'instituto']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
