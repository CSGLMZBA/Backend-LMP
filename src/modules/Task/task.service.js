import * as tasksRepository from './task.repository.js';
import * as projectsRepository from '../projects/projects.repository.js';
import * as chartsRepository from '../charts/charts.repository.js';
import { stagesRepository } from '../stages/stages.repository.js';

const sortByPriority = (tasks) => [...tasks].sort((a, b) => b.priority - a.priority);

const buildMappedStatusUpdate = (task, stage, userId) => {
  if (!stage?.mappedStatus || task.status === stage.mappedStatus) {
    return {};
  }

  return {
    status: stage.mappedStatus,
    completedAt: stage.mappedStatus === 'COMPLETED' ? new Date() : null,
    statusHistory: [
      ...(task.statusHistory || []),
      {
        status: stage.mappedStatus,
        changedBy: userId,
        changedAt: new Date(),
        comment: `Estado sincronizado por cambio a etapa ${stage.name}`,
      },
    ],
  };
};

const mapTaskListItem = (task) => ({
  id: task.id,
  name: task.name,
  teamId: task.teamId,
  projectId: task.projectId,
  chartId: task.chartId,
  stageId: task.stageId,
  description: task.description,
  assignedUserIds: task.assignedUserIds,
  workerIds: task.workerIds || [],
  priority: task.priority,
  status: task.status,
  startDate: task.startDate,
  dueDate: task.dueDate,
  createdBy: task.createdBy,
  createdAt: task.createdAt,
  completedAt: task.completedAt,
  tags: task.tags
});

const assertTaskRelations = async ({ teamId, projectId, chartId, stageId }) => {
  if (!projectId) {
    throw new Error('PROJECT_ID_REQUIRED');
  }

  const project = await projectsRepository.getProjectById(projectId);

  if (!project || project.status === 'DELETED') {
    throw new Error('PROJECT_NOT_FOUND');
  }

  if (project.teamId !== teamId) {
    throw new Error('PROJECT_TEAM_MISMATCH');
  }

  let resolvedChartId = chartId || null;
  let resolvedStageId = stageId || null;
  let resolvedStage = null;

  if (resolvedStageId) {
    const stage = await stagesRepository.findById(resolvedStageId);

    if (!stage || stage.teamId !== teamId) {
      throw new Error('STAGE_NOT_FOUND');
    }

    if (resolvedChartId && stage.chartId !== resolvedChartId) {
      throw new Error('STAGE_CHART_MISMATCH');
    }

    resolvedChartId = stage.chartId;
    resolvedStage = stage;
  }

  if (resolvedChartId) {
    const chart = await chartsRepository.getChartById(resolvedChartId);

    if (!chart) {
      throw new Error('CHART_NOT_FOUND');
    }

    if (chart.teamId !== teamId) {
      throw new Error('CHART_TEAM_MISMATCH');
    }

    if (chart.projectId !== projectId) {
      throw new Error('CHART_PROJECT_MISMATCH');
    }
  }

  return {
    projectId,
    chartId: resolvedChartId,
    stageId: resolvedStageId,
    stage: resolvedStage,
  };
};

const syncTaskStage = async (task, nextStageId, userId) => {
  const currentStageId = task.stageId || null;
  const targetStageId = nextStageId || null;

  if (currentStageId === targetStageId) {
    return {};
  }

  let targetStage = null;

  if (targetStageId) {
    targetStage = await stagesRepository.findById(targetStageId);

    const targetTaskCount = (targetStage.taskIds || []).length;
    if (targetStage.wipLimit !== null && targetTaskCount >= targetStage.wipLimit) {
      throw new Error('DESTINATION_WIP_LIMIT_REACHED');
    }
  }

  if (currentStageId) {
    await stagesRepository.removeTask(currentStageId, task.id);
  }

  if (targetStageId) {
    await stagesRepository.addTask(targetStageId, task.id);
  }

  return buildMappedStatusUpdate(task, targetStage, userId);
};

export const createTask = async (data, userId) => {
  if (!data.name || data.name.trim() === '') {
    throw new Error('TASK_NAME_REQUIRED');
  }
  
  if (!data.teamId) {
    throw new Error('TEAM_ID_REQUIRED');
  }

  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(
    data.teamId,
    userId
  );

  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }

  if (data.assignedUserIds?.length) {
    const usersValid = await tasksRepository.verifyUsersInTeam(
      data.teamId,
      data.assignedUserIds
    );

    if (!usersValid) {
      throw new Error('SOME_USERS_NOT_IN_TEAM');
    }
  }

  const relations = await assertTaskRelations({
    teamId: data.teamId,
    projectId: data.projectId,
    chartId: data.chartId,
    stageId: data.stageId,
  });
  
  const taskData = {
    name: data.name.trim(),
    teamId: data.teamId,
    projectId: relations.projectId,
    chartId: relations.chartId,
    stageId: relations.stageId,
    description: data.description || '',
    assignedUserIds: data.assignedUserIds || [],
    priority: data.priority || 2,
    createdBy: userId,
    createdAt: new Date(),
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
    completedAt: relations.stage?.mappedStatus === 'COMPLETED' ? new Date() : null,
    status: relations.stage?.mappedStatus || 'PENDING',
    isBlocked: data.isBlocked || false,
    blockedReason: data.blockedReason || null,
    timeEstimate: data.timeEstimate || null,
    timeSpent: 0,
    parentTaskId: data.parentTaskId || null,
    subtaskIds: [],
    tags: data.tags || [],
    attachments: data.attachments || [],
    statusHistory: [{
      status: relations.stage?.mappedStatus || 'PENDING',
      changedBy: userId,
      changedAt: new Date(),
      comment: 'Tarea creada'
    }],
    isDeleted: false
  };
  
  const newTask = await tasksRepository.createTask(taskData);

  if (taskData.stageId) {
    await stagesRepository.addTask(taskData.stageId, newTask.id);
  }

  return mapTaskListItem(newTask);
};

export const getTasksByTeam = async (teamId, userId) => {
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }
  
  const tasks = await tasksRepository.getTasksByTeamId(teamId);
  return sortByPriority(tasks).map(mapTaskListItem);
};

export const getTasksByStage = async (teamId, stageId, userId) => {
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }
  
  const tasks = await tasksRepository.getTasksByStageId(teamId, stageId);
  return sortByPriority(tasks).map(task => ({
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    projectId: task.projectId,
    chartId: task.chartId,
    stageId: task.stageId,
    assignedUserIds: task.assignedUserIds,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
  }));
};

export const getTasksByUser = async (userId, teamId = null, projectId = null) => {
  let tasks;
  
  if (projectId) {
    tasks = await tasksRepository.getTasksByUserAndProject(userId, projectId);
  } else if (teamId) {
    tasks = await tasksRepository.getTasksByUserAndTeam(userId, teamId);
  } else {
    tasks = await tasksRepository.getTasksByUserId(userId);
  }
  
  return sortByPriority(tasks).map(task => ({
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    projectId: task.projectId,
    chartId: task.chartId,
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
    projectId: task.projectId,
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

  if (updateData.assignedUserIds !== undefined) {
    const usersValid = await tasksRepository.verifyUsersInTeam(
      task.teamId,
      updateData.assignedUserIds
    );

    if (!usersValid) {
      throw new Error('SOME_USERS_NOT_IN_TEAM');
    }
  }

  const relations = await assertTaskRelations({
    teamId: task.teamId,
    projectId: updateData.projectId !== undefined ? updateData.projectId : task.projectId,
    chartId: updateData.chartId !== undefined ? updateData.chartId : task.chartId,
    stageId: updateData.stageId !== undefined ? updateData.stageId : task.stageId,
  });
  
  const updatedData = {
    projectId: relations.projectId,
    chartId: relations.chartId,
    stageId: relations.stageId,
  };

  if (updateData.stageId !== undefined) {
    Object.assign(
      updatedData,
      await syncTaskStage(task, relations.stageId, userId)
    );
  }

  if (updateData.name) updatedData.name = updateData.name.trim();
  if (updateData.description !== undefined) updatedData.description = updateData.description;
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
    teamId: updatedTask.teamId,
    projectId: updatedTask.projectId,
    chartId: updatedTask.chartId,
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

  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, userId);
  if (!userBelongsToTeam) throw new Error('UNAUTHORIZED_UPDATE');
  
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

  // IN_PROGRESS → REVIEW: guardar trabajadores y limpiar asignados
  if (task.status === 'IN_PROGRESS' && newStatus === 'REVIEW') {
    const current = task.assignedUserIds || [];
    const existing = task.workerIds || [];
    updateData.workerIds = [...new Set([...existing, ...current])];
    updateData.assignedUserIds = [];
  }

  // REVIEW → IN_PROGRESS: limpiar revisor y workers para el nuevo ciclo de trabajo
  if (task.status === 'REVIEW' && newStatus === 'IN_PROGRESS') {
    updateData.assignedUserIds = [];
    updateData.workerIds = [];
  }

  // REVIEW → COMPLETED: combinar trabajadores + revisor como historial de la tarea
  if (task.status === 'REVIEW' && newStatus === 'COMPLETED') {
    const workers = task.workerIds || [];
    const reviewer = task.assignedUserIds || [];
    updateData.assignedUserIds = [...new Set([...workers, ...reviewer])];
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
    completedAt: updatedTask.completedAt,
    assignedUserIds: updatedTask.assignedUserIds,
    workerIds: updatedTask.workerIds || [],
  };
};

export const assignUsersToTask = async (taskId, userIds, assignedBy) => {
  const task = await tasksRepository.getTaskById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');

  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(task.teamId, assignedBy);
  if (!userBelongsToTeam) throw new Error('UNAUTHORIZED_UPDATE');
  
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

export const getTasksByPriority = async (teamId, priority, userId) => {
  const userBelongsToTeam = await tasksRepository.verifyUserInTeam(teamId, userId);
  if (!userBelongsToTeam) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }

  const tasks = await tasksRepository.getTasksByPriority(teamId, priority);
  return sortByPriority(tasks).map(task => ({
    id: task.id,
    name: task.name,
    teamId: task.teamId,
    projectId: task.projectId,
    chartId: task.chartId,
    stageId: task.stageId,
    assignedUserIds: task.assignedUserIds,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate
  }));
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
