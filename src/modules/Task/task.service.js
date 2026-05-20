import * as tasksRepository from './task.repository.js';

export const createTask = async (data, userId) => {
  if (!data.name || data.name.trim() === '') {
    throw new Error('TASK_NAME_REQUIRED');
  }
  
  if (!data.teamId) {
    throw new Error('TEAM_ID_REQUIRED');
  }
  
  const taskData = {
    name: data.name.trim(),
    teamId: data.teamId,
    chartId: data.chartId || null,
    stageId: data.stageId || null,
    description: data.description || '',
    assignedUserIds: data.assignedUserIds || [],
    priority: data.priority || 2,
    createdBy: userId,
    createdAt: new Date(),
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
    completedAt: null,
    status: 'PENDING',
    isBlocked: false,
    blockedReason: null,
    timeEstimate: data.timeEstimate || null,
    timeSpent: 0,
    parentTaskId: data.parentTaskId || null,
    subtaskIds: [],
    tags: data.tags || [],
    attachments: data.attachments || [],
    statusHistory: [{
      status: 'PENDING',
      changedBy: userId,
      changedAt: new Date(),
      comment: 'Tarea creada'
    }],
    isDeleted: false
  };
  
  const newTask = await tasksRepository.createTask(taskData);
  
  return {
    id: newTask.id,
    name: newTask.name,
    teamId: newTask.teamId,
    chartId: newTask.chartId,
    stageId: newTask.stageId,
    description: newTask.description,
    assignedUserIds: newTask.assignedUserIds,
    priority: newTask.priority,
    status: newTask.status,
    startDate: newTask.startDate,
    dueDate: newTask.dueDate,
    createdBy: newTask.createdBy,
    createdAt: newTask.createdAt,
    tags: newTask.tags
  };
};

export const getTasksByTeam = async (teamId, userId) => {
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }
  
  const tasks = await tasksRepository.getTasksByTeamId(teamId);
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
  
  return sortedTasks.map(task => ({
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    chartId: task.chartId,
    stageId: task.stageId,
    description: task.description,
    assignedUserIds: task.assignedUserIds,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    tags: task.tags
  }));
};

export const getTasksByStage = async (teamId, stageId, userId) => {
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }
  
  const tasks = await tasksRepository.getTasksByStageId(teamId, stageId);
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
  
  return sortedTasks.map(task => ({
    id: task.id,
    name: task.name,
    assignedUserIds: task.assignedUserIds,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
  }));
};

export const getTasksByUser = async (userId, teamId = null) => {
  let tasks;
  
  if (teamId) {
    tasks = await tasksRepository.getTasksByUserAndTeam(userId, teamId);
  } else {
    tasks = await tasksRepository.getTasksByUserId(userId);
  }
  
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
  
  return sortedTasks.map(task => ({
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    stageId: task.stageId,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
  }));
};

export const getTaskById = async (taskId, userId) => {
  const task = await tasksRepository.getTaskById(taskId);
  
  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }
  
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TASK_ACCESS');
  }
  
  return {
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    chartId: task.chartId,
    stageId: task.stageId,
    description: task.description,
    assignedUserIds: task.assignedUserIds,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    isBlocked: task.isBlocked,
    blockedReason: task.blockedReason,
    timeEstimate: task.timeEstimate,
    timeSpent: task.timeSpent,
    parentTaskId: task.parentTaskId,
    tags: task.tags,
    attachments: task.attachments,
    statusHistory: task.statusHistory
  };
};

export const updateTask = async (taskId, updateData, userId) => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, userId);
  if (!userBelongsToTeam) throw new Error('UNAUTHORIZED_UPDATE');
  
  const updatedData = {};
  if (updateData.name) updatedData.name = updateData.name.trim();
  if (updateData.description !== undefined) updatedData.description = updateData.description;
  if (updateData.stageId !== undefined) updatedData.stageId = updateData.stageId;
  if (updateData.chartId !== undefined) updatedData.chartId = updateData.chartId;
  if (updateData.assignedUserIds !== undefined) updatedData.assignedUserIds = updateData.assignedUserIds;
  if (updateData.priority !== undefined) updatedData.priority = updateData.priority;
  if (updateData.startDate !== undefined) updatedData.startDate = updateData.startDate;
  if (updateData.dueDate !== undefined) updatedData.dueDate = updateData.dueDate;
  if (updateData.timeEstimate !== undefined) updatedData.timeEstimate = updateData.timeEstimate;
  if (updateData.timeSpent !== undefined) updatedData.timeSpent = updateData.timeSpent;
  if (updateData.tags !== undefined) updatedData.tags = updateData.tags;
  if (updateData.parentTaskId !== undefined) updatedData.parentTaskId = updateData.parentTaskId;
  if (updateData.isBlocked !== undefined) updatedData.isBlocked = updateData.isBlocked;
  if (updateData.blockedReason !== undefined) updatedData.blockedReason = updateData.blockedReason;
  
  updatedData.updatedAt = new Date();
  updatedData.updatedBy = userId;
  
  const updatedTask = await tasksRepository.updateTask(taskId, updatedData);
  
  return {
    id: updatedTask.id,
    name: updatedTask.name,
    stageId: updatedTask.stageId,
    assignedUserIds: updatedTask.assignedUserIds,
    priority: updatedTask.priority,
    status: updatedTask.status,
    dueDate: updatedTask.dueDate
  };
};

export const updateTaskStatus = async (taskId, newStatus, userId, comment = '') => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  
  const validTransitions = {
    'PENDING': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['REVIEW', 'CANCELLED'],
    'REVIEW': ['COMPLETED', 'IN_PROGRESS'],
    'COMPLETED': [],
    'CANCELLED': []
  };
  
  if (!validTransitions[task.status].includes(newStatus)) {
    throw new Error('INVALID_STATUS_TRANSITION');
  }
  
  const updateData = {
    status: newStatus,
    updatedAt: new Date(),
    updatedBy: userId
  };
  
  if (newStatus === 'COMPLETED') {
    updateData.completedAt = new Date();
  }
  
  const historyEntry = {
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    comment: comment || `Estado cambiado de ${task.status} a ${newStatus}`
  };
  
  updateData.statusHistory = [...(task.statusHistory || []), historyEntry];
  
  const updatedTask = await tasksRepository.updateTask(taskId, updateData);
  
  return {
    id: updatedTask.id,
    status: updatedTask.status,
    completedAt: updatedTask.completedAt
  };
};

export const assignUsersToTask = async (taskId, userIds, assignedBy) => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  
  const usersValid = await tasksRepository.verifyUsersInTeam(task.teamId, userIds);
  if (!usersValid) throw new Error('SOME_USERS_NOT_IN_TEAM');
  
  const updateData = {
    assignedUserIds: userIds,
    updatedAt: new Date(),
    updatedBy: assignedBy
  };
  
  const updatedTask = await tasksRepository.updateTask(taskId, updateData);
  
  return {
    id: updatedTask.id,
    assignedUserIds: updatedTask.assignedUserIds
  };
};

export const deleteTask = async (taskId, userId) => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  
  const isCreator = task.createdBy === userId;
  const isAdmin = await tasksRepository.isUserAdminInTeam(task.teamId, userId);
  
  if (!isCreator && !isAdmin) {
    throw new Error('UNAUTHORIZED_DELETE');
  }
  
  await tasksRepository.softDeleteTask(taskId);
  return { deleted: true, taskId: taskId };
};