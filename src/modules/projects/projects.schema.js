import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  teamId: z.string().min(1),
  description: z.string().max(500).optional(),
});
