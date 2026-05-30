import * as tasksService from '../task.service.js';
import * as commentsService from './comments.service.js';
import { successResponse, errorResponse, } from '../../../utils/response.js';

const relationErrorMessages = {
  PROJECT_ID_REQUIRED: ['Project ID is required', 400],
  PROJECT_NOT_FOUND: ['Project not found', 404],
  PROJECT_TEAM_MISMATCH: ['Project does not belong to this team', 400],
  CHART_NOT_FOUND: ['Chart not found', 404],
  CHART_TEAM_MISMATCH: ['Chart does not belong to this team', 400],
  CHART_PROJECT_MISMATCH: ['Chart does not belong to this project', 400],
  STAGE_CHART_MISMATCH: ['Stage does not belong to this chart', 400],
  DESTINATION_WIP_LIMIT_REACHED: ['Work in progress limit reached in destination stage', 400],
};

const handleRelationError = (res, error) => {
  const relationError = relationErrorMessages[error.message];

  if (!relationError) {
    return null;
  }

  const [message, status] = relationError;
  return errorResponse(res, message, error.message, [], status);
};

 //COMENTARIOS
export const postComment = async (req, res) => 
{
  try 
  {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.validatedData;
    const comment = await commentsService.postComment(id,userId,
      content
    );

    return successResponse(
      res,
      'Comment created successfully',
      comment,
      201
    );
  } catch (error) {
    const relationError = handleRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'TASK_NAME_REQUIRED') {
      return errorResponse(
        res,
        'Task name is required',
        'TASK_NAME_REQUIRED',
        [],
        400
      );
    }
    if (error.message === 'TEAM_ID_REQUIRED') {
      return errorResponse(
        res,
        'Team ID is required',
        'TEAM_ID_REQUIRED',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to create tasks for this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }
    if (error.message === 'SOME_USERS_NOT_IN_TEAM') {
      return errorResponse(
        res,
        'Some users are not members of the team',
        'SOME_USERS_NOT_IN_TEAM',
        [],
        400
      );
    }
    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found for this team',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    return errorResponse(res, 'Error creating task');
  }
};


export const getCommentsByTaskId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const comments = await commentsService.getCommentsByTaskId(id, userId);
    return successResponse(
      res,
      'comments retrieved successfully',
      comments
    );
  } catch (error) {
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to view tasks for this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving tasks');
  }
};

export const deleteCommentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id , commentId } = req.params;
    
    const result = await commentsService.deleteCommentById(commentId, id, userId);

    return successResponse(
      res,
      'Comentdeleted successfully',
      result
    );
  } catch (error) {
    if (error.message === 'COMMENT_NOT_FOUND') {
      return errorResponse(
        res,
        'Comment not found',
        'COMMENT_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'TASK_NOT_FOUND') {
      return errorResponse(
        res,
        'Task not found',
        'TASK_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED_DELETE') {
      return errorResponse(
        res,
        'You do not have permission to delete this comment',
        'UNAUTHORIZED_DELETE',
        [],
        403
      );
    }
    return errorResponse(res, 'Error deleting comment');
  }
};