import * as commentsService from './comments.service.js';
import { successResponse, errorResponse } from '../../../utils/response.js';
import { recordAudit } from '../../../middleware/audit.middleware.js';

const commentErrors = {
  TASK_NOT_FOUND: ['Task not found', 404],
  COMMENT_NOT_FOUND: ['Comment not found', 404],
  COMMENT_TASK_MISMATCH: ['Comment does not belong to this task', 400],
  UNAUTHORIZED_TASK_ACCESS: ['You do not have permission to access this task', 403],
  UNAUTHORIZED_COMMENT_MODIFICATION: [
    'You do not have permission to modify this comment',
    403,
  ],
};

const handleCommentError = (res, error, fallbackMessage) => {
  const commentError = commentErrors[error.message];

  if (!commentError) {
    return errorResponse(res, fallbackMessage);
  }

  const [message, status] = commentError;
  return errorResponse(res, message, error.message, [], status);
};

export const postComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: taskId } = req.params;
    const { content } = req.validatedData;
    const comment = await commentsService.createComment(taskId, userId, content);

    await recordAudit({
      action: 'create',
      entityType: 'comment',
      entityId: comment.id,
      userId,
      teamId: comment.teamId,
      chartId: comment.chartId,
      taskId: comment.taskId,
      details: {
        projectId: comment.projectId,
      },
    });

    return successResponse(
      res,
      'Comment created successfully',
      comment,
      201
    );
  } catch (error) {
    return handleCommentError(res, error, 'Error creating comment');
  }
};

export const getCommentsByTaskId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: taskId } = req.params;
    const comments = await commentsService.getCommentsByTaskId(taskId, userId);

    return successResponse(
      res,
      'Comments retrieved successfully',
      comments
    );
  } catch (error) {
    return handleCommentError(res, error, 'Error retrieving comments');
  }
};

export const getCommentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: taskId, commentId } = req.params;
    const comment = await commentsService.getCommentById(
      commentId,
      taskId,
      userId
    );

    return successResponse(
      res,
      'Comment retrieved successfully',
      comment
    );
  } catch (error) {
    return handleCommentError(res, error, 'Error retrieving comment');
  }
};

export const updateCommentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: taskId, commentId } = req.params;
    const { content } = req.validatedData;
    const comment = await commentsService.updateCommentById(
      commentId,
      taskId,
      userId,
      content
    );

    await recordAudit({
      action: 'update',
      entityType: 'comment',
      entityId: comment.id,
      userId,
      teamId: comment.teamId,
      chartId: comment.chartId,
      taskId: comment.taskId,
      details: {
        projectId: comment.projectId,
      },
    });

    return successResponse(
      res,
      'Comment updated successfully',
      comment
    );
  } catch (error) {
    return handleCommentError(res, error, 'Error updating comment');
  }
};

export const deleteCommentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: taskId, commentId } = req.params;
    const result = await commentsService.deleteCommentById(
      commentId,
      taskId,
      userId
    );

    await recordAudit({
      action: 'delete',
      entityType: 'comment',
      entityId: result.commentId,
      userId,
      teamId: result.teamId,
      chartId: result.chartId,
      taskId: result.taskId,
      details: {
        projectId: result.projectId,
        softDelete: true,
      },
    });

    return successResponse(
      res,
      'Comment deleted successfully',
      result
    );
  } catch (error) {
    return handleCommentError(res, error, 'Error deleting comment');
  }
};
