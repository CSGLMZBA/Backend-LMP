import { z } from 'zod';

export const create = z.object({
  name: z.string().min(1, 'Chart name is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  teamId: z.string().min(1, 'Team id is required'),
  stageIds: z.array(z.string()).optional().default([]),
});

export const update = z.object({
  name: z.string().min(1, 'Chart name is too short').optional()
});

export const updateParams = z.object({
  chartId: z.string().min(1, 'Chart ID is required'),
});

export const removeStage = z.object({
  stageId: z.string().optional()
});
