import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
  phone: z.string().optional(),
});

export type CustomerForm = z.infer<typeof CustomerSchema>;
