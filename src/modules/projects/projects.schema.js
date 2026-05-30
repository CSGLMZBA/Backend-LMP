import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  teamId: z.string().min(1),
  description: z.string().max(500).optional(),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1),
});

export const getProjectsQuerySchema = z.object({
  teamId: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  search: z.string().max(100).optional(),
  ownerId: z.string().min(1).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED']),
});
