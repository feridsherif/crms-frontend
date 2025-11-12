import { z } from 'zod';

export const BranchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type BranchForm = z.infer<typeof BranchSchema>;
