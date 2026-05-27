import { z } from 'zod';

const globalRoleSchema = z.enum(['admin', 'user', 'client']);

export const rolesSchema = {
  post: z.object({
    roleName: globalRoleSchema,
    roleLevel: z.number().int().min(0).max(4).optional(),
  }),
  putParams: z.object({
    roleId: z.string().min(1)
  }),
  put: z.object({
    roleName: globalRoleSchema,
    roleLevel: z.number().int().min(0).max(4),
  }),
  deleteParams: z.object({
    roleId: z.string().min(1)
  }),
};
