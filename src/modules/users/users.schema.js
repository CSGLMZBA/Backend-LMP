import { z } from 'zod';

export const usersSchema = {
  post: z.object({
    displayName: z.string().min(3),
    userName: z.string().min(3),
    email: z.string().email(),
    role: z.string().optional(),
    status: z.string().optional(),
    password: z.string().min(6),
    active: z.boolean().optional(),
  }),
  getParams: z.object({
    userId: z.string().min(1),
  }),
  putParams: z.object({
    userId: z.string().min(1),
  }),
  patchStatusParams: z.object({
    userId: z.string().min(1)
  }),
  patchStatus: z.object({
    status: z.string().min(1)
  }),
  put: z.object({
    displayName: z.string().min(2),
    userName: z.string().min(3),
    email: z.string().email(),
    role: z.string().min(3),
    status: z.string(),
    password: z.string().min(6),
    active: z.boolean(),
  }),

  softDeleteParams: z.object({
    userId: z.string().min(1),
  }),

  softDelete: z.object({
  }),
};