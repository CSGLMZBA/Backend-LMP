import { z } from 'zod';

export const postParams = z.object({
  id: z.string().min(1, 'Task ID is required'),
});
export const getParams = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const comment = z.object(
  {
    content: z.string().min(1,'The comment must contain some content'),
  }
);

export const deleteParams = z.object({
  id: z.string().min(1, 'Task ID is required'),
  commentId: z.string().min(1, 'Comment ID is required'),
});
