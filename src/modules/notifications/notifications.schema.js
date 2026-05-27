import { z } from 'zod';

export const notificationsSchema = {
  notificationParams: z.object({
    notificationId: z.string().min(1),
  }),
};
