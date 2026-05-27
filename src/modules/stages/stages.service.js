import { stagesRepository } from './stages.repository.js';
import * as teamsService from '../teams/teams.service.js';
import * as tasksRepository from '../Task/task.repository.js';
import * as chartsRepository from '../charts/charts.repository.js';

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

  const chart = await chartsRepository.getChartById(data.chartId);

  if (!chart) {
    throw new Error('CHART_NOT_FOUND');
  }

  if (chart.teamId !== data.teamId) {
    throw new Error('CHART_TEAM_MISMATCH');
  }
  
  // Crear objeto de etapa
  const stageData = {
    name: data.name.trim(),
    teamId: data.teamId,
    chartId: data.chartId,
    taskIds: data.taskIds || [],
    wipLimit: data.wipLimit || null,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false
  };
  
  // Guardar en base de datos
  const newStage = await stagesRepository.create(stageData);
  await chartsRepository.addStageToChart(data.chartId, newStage.id);
  
  return removeSensitiveFields({
    id: newStage.id,
    name: newStage.name,
    teamId: newStage.teamId,
    chartId: newStage.chartId,
    taskIds: newStage.taskIds,
    wipLimit: newStage.wipLimit,
    createdBy: newStage.createdBy,
    createdAt: newStage.createdAt
  });
};

// OBTENER ETAPAS POR CHART 
export const getStagesByChart = async (chartId, teamId, userId) => {
  await assertStageTeamAccess(teamId, userId);
  
  // Obtener etapas del chart
  const stages = await stagesRepository.findByChartId(chartId, teamId);
  
  return stages.map(stage => removeSensitiveFields({
    id: stage.id,
    name: stage.name,
    teamId: stage.teamId,
    chartId: stage.chartId,
    taskIds: stage.taskIds || [],
    wipLimit: stage.wipLimit,
    createdBy: stage.createdBy,
    createdAt: stage.createdAt
  }));
};

// OBTENER ETAPA POR ID
export const getStageById = async (stageId, userId) => {
  const stage = await stagesRepository.findById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  await assertStageTeamAccess(
    stage.teamId,
    userId,
    'UNAUTHORIZED_STAGE_ACCESS'
  );
  
  return removeSensitiveFields({
    id: stage.id,
    name: stage.name,
    teamId: stage.teamId,
    chartId: stage.chartId,
    taskIds: stage.taskIds || [],
    wipLimit: stage.wipLimit,
    createdBy: stage.createdBy,
    createdAt: stage.createdAt
  });
};

//ACTUALIZAR ETAPA
export const updateStage = async (stageId, payload, userId) => {
  // Verificar que la etapa existe
  const stage = await stagesRepository.findById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
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
  
  if (data.isArchived !== undefined) {
    data.isArchived = Boolean(data.isArchived);
  }
  
  data.updatedAt = new Date();
  
  // Actualizar en base de datos
  const updated = await stagesRepository.update(stageId, data);
  
  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    teamId: updated.teamId,
    chartId: updated.chartId,
    taskIds: updated.taskIds || [],
    wipLimit: updated.wipLimit,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt
  });
};

// AGREGAR TAREA A ETAPA
export const addTaskToStage = async (stageId, taskId, userId) => {
  // Verificar que la etapa existe
  const stage = await stagesRepository.findById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
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
  
  // Agregar tarea al array del stage y actualizar stageId en la tarea
  const updated = await stagesRepository.addTask(stageId, taskId);
  await tasksRepository.updateTask(taskId, { stageId, updatedAt: new Date() });

  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    taskIds: updated.taskIds || [],
    wipLimit: updated.wipLimit
  });
};

//REMOVER TAREA DE ETAPA
export const removeTaskFromStage = async (stageId, taskId, userId) => {
  // Verificar que la etapa existe
  const stage = await stagesRepository.findById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
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
  await tasksRepository.updateTask(taskId, { stageId: null, updatedAt: new Date() });

  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    taskIds: updated.taskIds || []
  });
};

//MOVER TAREA ENTRE ETAPAS
export const moveTaskBetweenStages = async (taskId, fromStageId, toStageId, userId) => {
  // Verificar que ambas etapas existen
  const fromStage = await stagesRepository.findById(fromStageId);
  const toStage = await stagesRepository.findById(toStageId);
  
  if (!fromStage || !toStage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que pertenecen al mismo equipo
  if (fromStage.teamId !== toStage.teamId) {
    throw new Error('STAGES_FROM_DIFFERENT_TEAMS');
  }
  
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
  
  // Remover de etapa origen y agregar a etapa destino
  const [, updatedToStage] = await Promise.all([
    stagesRepository.removeTask(fromStageId, taskId),
    stagesRepository.addTask(toStageId, taskId),
  ]);

  // Actualizar stageId en la tarea
  await tasksRepository.updateTask(taskId, { stageId: toStageId, updatedAt: new Date() });

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
    }
  };
};

// ELIMINAR ETAPA (soft delete)
export const deleteStage = async (stageId, userId) => {
  const stage = await stagesRepository.findById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
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

//CREAR ETAPAS POR DEFECTO PARA NUEVO CHART
export const createDefaultStages = async (chartId, teamId, userId) => {
  const defaultStages = [
    { name: 'To Do', wipLimit: null },
    { name: 'In Progress', wipLimit: 5 },
    { name: 'Review', wipLimit: 3 },
    { name: 'Done', wipLimit: null }
  ];
  
  const createdStages = [];
  
  for (const stageData of defaultStages) {
    const stage = await createStage({
      name: stageData.name,
      teamId: teamId,
      chartId: chartId,
      wipLimit: stageData.wipLimit,
      taskIds: []
    }, userId);
    
    createdStages.push(stage);
  }
  
  return createdStages;
};
