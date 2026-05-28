import { z } from 'zod';

export const create = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().max(500).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const update = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
  description: z.string().max(500).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: 'At least one team field is required',
});

export const updateTeamStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
});

export const teamIdParamSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
});

export const joinTeamSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['MANAGER', 'MEMBER', 'CLIENT']).default('MEMBER'),
});
