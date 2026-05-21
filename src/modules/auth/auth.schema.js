import { z } from 'zod';

export const userSchema = {
  register: z.object({
    displayName: z.string().min(3),
    userName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    status: z.string().optional(),
    active: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),

  updatePassword: z.object({
    oldPassword: z.string().min(6),
    password: z.string().min(6),
  }),
};