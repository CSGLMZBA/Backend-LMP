import { z } from 'zod';

const selfRegisterRoleSchema = z.enum(['user', 'client']);

export const userSchema = {
  register: z.object({
    displayName: z.string().min(3),
    userName: z.string().min(3),
    email: z.string().email(),
    role: selfRegisterRoleSchema.optional(),
    password: z.string().min(6),
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
