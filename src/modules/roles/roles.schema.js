import { z } from 'zod';

export const rolesSchema = {
  post: z.object({
    roleName: z.string().min(3),
    roleLevel: z.number().int().min(0).optional(),
  }),
  putParams: z.object({
    roleId: z.string().min(1)
  }),
  put: z.object({
    roleName: z.string().min(3),
    roleLevel: z.number().int().min(0),
  }),
  deleteParams: z.object({
    roleId: z.string().min(1)
  }),
};