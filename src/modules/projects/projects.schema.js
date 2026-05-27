import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  teamId: z.string().min(1),
  description: z.string().max(500).optional(),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED']),
});
