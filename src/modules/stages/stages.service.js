import { stagesRepository } from './stages.repository.js';
import * as teamsService from '../teams/teams.service.js';
import * as tasksRepository from '../Task/task.repository.js';
import * as chartsRepository from '../charts/charts.repository.js';

const DEFAULT_STAGES = [
  { name: 'To Do', wipLimit: null, mappedStatus: 'PENDING', order: 0 },
  { name: 'In Progress', wipLimit: 5, mappedStatus: 'IN_PROGRESS', order: 1 },
  { name: 'Review', wipLimit: 3, mappedStatus: 'REVIEW', order: 2 },
  { name: 'Done', wipLimit: null, mappedStatus: 'COMPLETED', order: 3 },
];

// Helper para remover campos sensibles (si los hubiera)
const removeSensitiveFields = (stage) => {
  if (!stage) return stage;
  
  const clean = { ...stage };
  // Si hay campos sensibles, los eliminamos aquí
  // delete clean.someSensitiveField;
  
  return clean;
};

const assertStageTeamAccess = async (
  teamId,
  userId,
  errorCode = 'UNAUTHORIZED_TEAM_ACCESS'
) => {
  try {
    return await teamsService.assertTeamMembership(teamId, userId);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      throw new Error(errorCode);
    }

    throw error;
  }
};

const mapStage = (stage) => removeSensitiveFields({
  id: stage.id,
  name: stage.name,
  teamId: stage.teamId,
  chartId: stage.chartId,
  taskIds: stage.taskIds || [],
  wipLimit: stage.wipLimit,
  order: Number.isInteger(stage.order) ? stage.order : null,
  mappedStatus: stage.mappedStatus || null,
  createdBy: stage.createdBy,
  createdAt: stage.createdAt,
});

const getNextStageOrder = async (chartId, teamId) => {
  const stages = await stagesRepository.findByChartId(chartId, teamId);
  const maxOrder = stages.reduce((max, stage) => (
    Number.isInteger(stage.order) && stage.order > max ? stage.order : max
  ), -1);

  return maxOrder + 1;
};

const assertOrderAvailable = async (chartId, teamId, order, stageId = null) => {
  if (order === undefined) {
    return;
  }

  const stages = await stagesRepository.findByChartId(chartId, teamId);
  const duplicated = stages.some((stage) =>
    stage.id !== stageId && stage.order === order
  );

  if (duplicated) {
    throw new Error('STAGE_ORDER_ALREADY_EXISTS');
  }
};

const assertActiveChartForTeam = async (chartId, teamId) => {
  const chart = await chartsRepository.getChartById(chartId);

  if (!chart || chart.isArchived) {
    throw new Error('CHART_NOT_FOUND');
  }

  if (chart.teamId !== teamId) {
    throw new Error('CHART_TEAM_MISMATCH');
  }

  return chart;
};

const assertActiveStage = (stage) => {
  if (!stage || stage.isArchived) {
    throw new Error('STAGE_NOT_FOUND');
  }

  return stage;
};

const buildMappedStatusUpdate = (task, stage, userId) => {
  if (!stage.mappedStatus || task.status === stage.mappedStatus) {
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
        comment: `Estado sincronizado por movimiento a etapa ${stage.name}`,
      },
    ],
  };
};

const assertTaskCanMove = async (taskId, fromStage, toStage) => {
  const task = await tasksRepository.getTaskById(taskId);

  if (!task || task.isDeleted) {
    throw new Error('TASK_NOT_FOUND');
  }

  if (task.teamId !== fromStage.teamId || task.teamId !== toStage.teamId) {
    throw new Error('TASK_STAGE_TEAM_MISMATCH');
  }

  if (fromStage.chartId !== toStage.chartId || task.chartId !== toStage.chartId) {
    throw new Error('TASK_STAGE_CHART_MISMATCH');
  }

  const taskIsInSourceStage =
    task.stageId === fromStage.id || (fromStage.taskIds || []).includes(taskId);

  if (!taskIsInSourceStage) {
    throw new Error('TASK_NOT_IN_SOURCE_STAGE');
  }

  return task;
};

// CREAR ETAPA
export const createStage = async (data, userId) => {
  // Validaciones básicas
  if (!data.name || data.name.trim() === '') {
    throw new Error('STAGE_NAME_REQUIRED');
  }
  
  if (!data.teamId) {
    throw new Error('TEAM_ID_REQUIRED');
  }
  
  if (!data.chartId) {
    throw new Error('CHART_ID_REQUIRED');
  }
  
  await assertStageTeamAccess(data.teamId, userId);

  await assertActiveChartForTeam(data.chartId, data.teamId);
  
  const order = data.order ?? await getNextStageOrder(data.chartId, data.teamId);
  await assertOrderAvailable(data.chartId, data.teamId, order);

  // Crear objeto de etapa
  const stageData = {
    name: data.name.trim(),
    teamId: data.teamId,
    chartId: data.chartId,
    taskIds: data.taskIds || [],
    wipLimit: data.wipLimit || null,
    order,
    mappedStatus: data.mappedStatus || null,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false
  };
  
  // Guardar en base de datos
  const newStage = await stagesRepository.create(stageData);
  await chartsRepository.addStageToChart(data.chartId, newStage.id);
  
  return mapStage(newStage);
};

// OBTENER ETAPAS POR CHART 
export const getStagesByChart = async (chartId, teamId, userId) => {
  await assertStageTeamAccess(teamId, userId);
  await assertActiveChartForTeam(chartId, teamId);
  
  // Obtener etapas del chart
  const stages = await stagesRepository.findByChartId(chartId, teamId);
  
  return stages.map(mapStage);
};

// OBTENER ETAPA POR ID
export const getStageById = async (stageId, userId) => {
  const stage = assertActiveStage(await stagesRepository.findById(stageId));
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_ACCESS'
  );

  await assertActiveChartForTeam(stage.chartId, stage.teamId);
  
  return mapStage(stage);
};

//ACTUALIZAR ETAPA
export const updateStage = async (stageId, payload, userId) => {
  // Verificar que la etapa existe
  const stage = assertActiveStage(await stagesRepository.findById(stageId));

  await assertActiveChartForTeam(stage.chartId, stage.teamId);
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_UPDATE'
  );
  
  // Preparar datos para actualizar
  const data = { ...payload };
  
  if (data.name !== undefined) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('STAGE_NAME_REQUIRED');
    }
    data.name = data.name.trim();
  }
  
  if (data.wipLimit !== undefined && data.wipLimit !== null) {
    if (data.wipLimit < 0) {
      throw new Error('WIP_LIMIT_INVALID');
    }
  }

  if (data.order !== undefined) {
    await assertOrderAvailable(stage.chartId, stage.teamId, data.order, stageId);
  }
  
  if (data.isArchived !== undefined) {
    data.isArchived = Boolean(data.isArchived);
  }
  
  data.updatedAt = new Date();
  
  // Actualizar en base de datos
  const updated = await stagesRepository.update(stageId, data);
  
  return mapStage(updated);
};

export const reorderStages = async (chartId, teamId, stageIds, userId) => {
  await assertStageTeamAccess(
    teamId,
    userId,
    'UNAUTHORIZED_STAGE_UPDATE'
  );

  await assertActiveChartForTeam(chartId, teamId);

  const stages = await stagesRepository.findByChartId(chartId, teamId);
  const existingIds = new Set(stages.map((stage) => stage.id));
  const requestedIds = new Set(stageIds);

  if (
    requestedIds.size !== stageIds.length ||
    requestedIds.size !== existingIds.size ||
    !stageIds.every((stageId) => existingIds.has(stageId))
  ) {
    throw new Error('STAGE_ORDER_INVALID');
  }

  const updatedStages = await Promise.all(
    stageIds.map((stageId, index) =>
      stagesRepository.update(stageId, {
        order: index,
        updatedAt: new Date(),
      })
    )
  );

  return updatedStages
    .map(mapStage)
    .sort((a, b) => a.order - b.order);
};

// AGREGAR TAREA A ETAPA
export const addTaskToStage = async (stageId, taskId, userId) => {
  // Verificar que la etapa existe
  const stage = assertActiveStage(await stagesRepository.findById(stageId));

  await assertActiveChartForTeam(stage.chartId, stage.teamId);
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_UPDATE'
  );
  
  // Verificar WIP limit si existe
  const currentTaskCount = (stage.taskIds || []).length;
  if (stage.wipLimit !== null && currentTaskCount >= stage.wipLimit) {
    throw new Error('WIP_LIMIT_REACHED');
  }
  
  // Verificar que la tarea no esté ya en la etapa
  if ((stage.taskIds || []).includes(taskId)) {
    throw new Error('TASK_ALREADY_IN_STAGE');
  }
  
  const task = await tasksRepository.getTaskById(taskId);
  if (!task || task.isDeleted) {
    throw new Error('TASK_NOT_FOUND');
  }

  if (task.teamId !== stage.teamId || task.chartId !== stage.chartId) {
    throw new Error('TASK_STAGE_CHART_MISMATCH');
  }

  if (task.stageId && task.stageId !== stageId) {
    throw new Error('TASK_ALREADY_IN_ANOTHER_STAGE');
  }

  // Agregar tarea al array del stage y actualizar stageId/status en la tarea
  const updated = await stagesRepository.addTask(stageId, taskId);
  await tasksRepository.updateTask(taskId, {
    stageId,
    ...buildMappedStatusUpdate(task, stage, userId),
    updatedAt: new Date(),
    updatedBy: userId,
  });

  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    taskIds: updated.taskIds || [],
    wipLimit: updated.wipLimit,
    order: Number.isInteger(updated.order) ? updated.order : null,
    mappedStatus: updated.mappedStatus || null,
  });
};

//REMOVER TAREA DE ETAPA
export const removeTaskFromStage = async (stageId, taskId, userId) => {
  // Verificar que la etapa existe
  const stage = assertActiveStage(await stagesRepository.findById(stageId));

  await assertActiveChartForTeam(stage.chartId, stage.teamId);
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_UPDATE'
  );
  
  // Verificar que la tarea está en la etapa
  if (!(stage.taskIds || []).includes(taskId)) {
    throw new Error('TASK_NOT_IN_STAGE');
  }
  
  // Remover tarea del array del stage y limpiar stageId en la tarea
  const updated = await stagesRepository.removeTask(stageId, taskId);
  await tasksRepository.updateTask(taskId, {
    stageId: null,
    updatedAt: new Date(),
    updatedBy: userId,
  });

  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    taskIds: updated.taskIds || [],
    order: Number.isInteger(updated.order) ? updated.order : null,
    mappedStatus: updated.mappedStatus || null,
  });
};

//MOVER TAREA ENTRE ETAPAS
export const moveTaskBetweenStages = async (taskId, fromStageId, toStageId, userId) => {
  // Verificar que ambas etapas existen
  const fromStage = assertActiveStage(await stagesRepository.findById(fromStageId));
  const toStage = assertActiveStage(await stagesRepository.findById(toStageId));
  
  // Verificar que pertenecen al mismo equipo
  if (fromStage.teamId !== toStage.teamId) {
    throw new Error('STAGES_FROM_DIFFERENT_TEAMS');
  }

  if (fromStage.chartId !== toStage.chartId) {
    throw new Error('STAGES_FROM_DIFFERENT_CHARTS');
  }

  await assertActiveChartForTeam(fromStage.chartId, fromStage.teamId);
  
  await assertStageTeamAccess(
    fromStage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_UPDATE'
  );
  
  // Verificar WIP limit de la etapa destino
  const toStageTaskCount = (toStage.taskIds || []).length;
  if (toStage.wipLimit !== null && toStageTaskCount >= toStage.wipLimit) {
    throw new Error('DESTINATION_WIP_LIMIT_REACHED');
  }

  const task = await assertTaskCanMove(taskId, fromStage, toStage);
  
  // Remover de etapa origen y agregar a etapa destino
  const [, updatedToStage] = await Promise.all([
    stagesRepository.removeTask(fromStageId, taskId),
    stagesRepository.addTask(toStageId, taskId),
  ]);

  // Actualizar stageId y status logico si la etapa destino lo define
  const taskUpdate = {
    stageId: toStageId,
    ...buildMappedStatusUpdate(task, toStage, userId),
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const updatedTask = await tasksRepository.updateTask(taskId, taskUpdate);

  const fromUpdatedTaskIds = (fromStage.taskIds || []).filter(id => id !== taskId);
  const toUpdatedTaskIds = [...(toStage.taskIds || []), taskId];

  return {
    fromStage: {
      id: fromStageId,
      taskIds: fromUpdatedTaskIds
    },
    toStage: {
      id: toStageId,
      taskIds: toUpdatedTaskIds,
      wipLimitReached: updatedToStage.wipLimit !== null && toUpdatedTaskIds.length >= updatedToStage.wipLimit
    },
    task: {
      id: updatedTask.id,
      stageId: updatedTask.stageId,
      status: updatedTask.status,
    },
  };
};

// ELIMINAR ETAPA (soft delete)
export const deleteStage = async (stageId, userId) => {
  const stage = assertActiveStage(await stagesRepository.findById(stageId));

  await assertActiveChartForTeam(stage.chartId, stage.teamId);
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_DELETE'
  );
  
  // Verificar que la etapa no tenga tareas
  if ((stage.taskIds || []).length > 0) {
    throw new Error('STAGE_HAS_TASKS');
  }
  
  // Soft delete (borrado lógico)
  await stagesRepository.softDelete(stageId);
  await chartsRepository.removeStageFromChart(stage.chartId, stageId);
  
  return { deleted: true, stageId: stageId };
};

export const archiveStagesByChart = async (chartId, teamId, userId) => {
  return stagesRepository.archiveByChartId(chartId, teamId, userId);
};

//CREAR ETAPAS POR DEFECTO PARA NUEVO CHART
export const createDefaultStages = async (chartId, teamId, userId) => {
  await assertActiveChartForTeam(chartId, teamId);

  const existingStages = await stagesRepository.findByChartId(chartId, teamId);

  if (existingStages.length > 0) {
    throw new Error('DEFAULT_STAGES_ALREADY_EXIST');
  }

  const createdStages = [];
  
  for (const stageData of DEFAULT_STAGES) {
    const stage = await createStage({
      name: stageData.name,
      teamId: teamId,
      chartId: chartId,
      wipLimit: stageData.wipLimit,
      order: stageData.order,
      mappedStatus: stageData.mappedStatus,
      taskIds: []
    }, userId);
    
    createdStages.push(stage);
  }
  
  return createdStages;
};
