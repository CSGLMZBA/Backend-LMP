import * as tasksRepository from '../task.repository.js';
import * as commentsRepository from './comments.repository.js';

export const postComment = async (taskId,userId,data) => 
{
  const task = await tasksRepository.getTaskById(taskId);
  
  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }
  
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TASK_ACCESS');
  }
  
  const comment = await commentsRepository.postComment
  (
    {
      taskId: taskId,
      posterId:userId,
      contents: data.content
    }
  );
  return comment;
}

export const getCommentsByTaskId = async(taskId,userId) => 
{
  const task = await tasksRepository.getTaskById(taskId);
  
  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }
  
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TASK_ACCESS');
  }
  
  const comments = await commentsRepository.getCommentsByTaskId(taskId);
  return comments;
}

export const deleteCommentById = async (commentId, taskId, userId) => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  const comment = await commentsRepository.getCommentById(commentId);
  if(!comment) throw new Error('COMMENT_NOT_FOUND');
  const isCreator = comment.posterId === userId;
  const isAdmin = await tasksRepository.isUserAdminInTeam(task.teamId, userId);
  
  if (!isCreator && !isAdmin) {
    throw new Error('UNAUTHORIZED_DELETE');
  }
  
  await commentsRepository.deleteComment(commentId);
  return { deleted: true, commentId: commentId};
};
