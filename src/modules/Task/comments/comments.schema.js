import { z } from 'zod';

export const taskCommentParams = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const taskCommentIdParams = z.object({
  id: z.string().min(1, 'Task ID is required'),
  commentId: z.string().min(1, 'Comment ID is required'),
});

export const commentBody = z.object({
  content: z.string()
    .trim()
    .min(1, 'The comment must contain some content')
    .max(1000, 'The comment must be less than 1000 characters'),
});

export const updateCommentBody = commentBody;
