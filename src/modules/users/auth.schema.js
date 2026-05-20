import { z } from 'zod';

export const userSchema = {
  register: z.object({
    displayName: z.string().min(3),
    userName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    activo: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),

  updateParams: z.object({
    userId: z.string().min(1),
  }),

  update: z.object({
    displayName: z.string().min(2).optional(),
    userName: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    activo: z.boolean().optional(),
  }),

  softDeleteParams: z.object({
    userId: z.string().min(1),
  }),

  softDelete: z.object({
  }),
};