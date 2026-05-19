import { z } from 'zod';

export const create = z.object({
  name: z.string().min(1, 'Team name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const update = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});
