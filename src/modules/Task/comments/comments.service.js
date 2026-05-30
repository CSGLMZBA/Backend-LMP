import * as tasksRepository from '../task.repository.js';
import * as teamsService from '../../teams/teams.service.js';
import * as commentsRepository from './comments.repository.js';

const COMMENT_MODERATOR_ROLES = ['OWNER', 'MANAGER'];

const mapComment = (comment) => ({
  id: comment.id,
  taskId: comment.taskId,
  teamId: comment.teamId,
  projectId: comment.projectId || null,
  chartId: comment.chartId || null,
  posterId: comment.posterId,
  content: comment.content,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const assertTaskAccess = async (taskId, userId) => {
  const task = await tasksRepository.getTaskById(taskId);

  if (!task || task.isDeleted) {
    throw new Error('TASK_NOT_FOUND');
  }

  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(
    task.teamId,
    userId
  );

  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TASK_ACCESS');
  }

  return task;
};

const assertCommentForTask = (comment, taskId) => {
  if (!comment || comment.isDeleted) {
    throw new Error('COMMENT_NOT_FOUND');
  }

  if (comment.taskId !== taskId) {
    throw new Error('COMMENT_TASK_MISMATCH');
  }

  return comment;
};

const canModerateComments = async (teamId, userId) => {
  try {
    await teamsService.assertTeamRole(teamId, userId, COMMENT_MODERATOR_ROLES);
    return true;
  } catch (error) {
    if (
      error.message === 'INSUFFICIENT_TEAM_ROLE' ||
      error.message === 'UNAUTHORIZED_TEAM_ACCESS'
    ) {
      return false;
    }

    throw error;
  }
};

const assertCanMutateComment = async (comment, task, userId) => {
  const isCreator = comment.posterId === userId;
  const isModerator = await canModerateComments(task.teamId, userId);

  if (!isCreator && !isModerator) {
    throw new Error('UNAUTHORIZED_COMMENT_MODIFICATION');
  }
};

export const createComment = async (taskId, userId, content) => {
  const task = await assertTaskAccess(taskId, userId);

  const comment = await commentsRepository.createComment({
    taskId,
    teamId: task.teamId,
    projectId: task.projectId || null,
    chartId: task.chartId || null,
    posterId: userId,
    content,
  });

  return mapComment(comment);
};

export const getCommentsByTaskId = async (taskId, userId) => {
  await assertTaskAccess(taskId, userId);

  const comments = await commentsRepository.getCommentsByTaskId(taskId);
  return comments.map(mapComment);
};

export const getCommentById = async (commentId, taskId, userId) => {
  await assertTaskAccess(taskId, userId);
  const comment = assertCommentForTask(
    await commentsRepository.getCommentById(commentId),
    taskId
  );

  return mapComment(comment);
};

export const updateCommentById = async (commentId, taskId, userId, content) => {
  const task = await assertTaskAccess(taskId, userId);
  const comment = assertCommentForTask(
    await commentsRepository.getCommentById(commentId),
    taskId
  );

  await assertCanMutateComment(comment, task, userId);

  const updated = await commentsRepository.updateComment(commentId, {
    content,
    updatedBy: userId,
  });

  return mapComment(updated);
};

export const deleteCommentById = async (commentId, taskId, userId) => {
  const task = await assertTaskAccess(taskId, userId);
  const comment = assertCommentForTask(
    await commentsRepository.getCommentById(commentId),
    taskId
  );

  await assertCanMutateComment(comment, task, userId);
  await commentsRepository.deleteComment(commentId, userId);

  return {
    deleted: true,
    commentId,
    taskId,
    teamId: task.teamId,
    projectId: task.projectId || null,
    chartId: task.chartId || null,
  };
};
