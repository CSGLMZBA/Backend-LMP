import { z } from 'zod';

export const create = z.object({
  name: z.string().min(1, 'Chart name is required'),
  teamId: z.string().min(1, 'Team id is required'),
  stageIds: z.array(z.string()).min(2, 'Every chart must have at least 2 stages')

});

export const update = z.object({
  name: z.string().min(1, 'Chart name is too short').optional()
});

export const removeStage = z.object({
  stageId: z.string().optional()
});
