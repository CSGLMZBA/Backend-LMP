import * as stagesRepository from './stages.repository.js';
import * as teamsRepository from '../teams/teams.repository.js';

// Helper para remover campos sensibles (si los hubiera)
const removeSensitiveFields = (stage) => {
  if (!stage) return stage;
  
  const clean = { ...stage };
  // Si hay campos sensibles, los eliminamos aquí
  // delete clean.someSensitiveField;
  
  return clean;
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
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(data.teamId);
  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }
  
  if (!team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
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
  const newStage = await stagesRepository.createStage(stageData);
  
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
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(teamId);
  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }
  
  if (!team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_TEAM_ACCESS');
  }
  
  // Obtener etapas del chart
  const stages = await stagesRepository.getStagesByChartId(chartId, teamId);
  
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
  const stage = await stagesRepository.getStageById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(stage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_ACCESS');
  }
  
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
  const stage = await stagesRepository.getStageById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(stage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_UPDATE');
  }
  
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
  const updated = await stagesRepository.updateStage(stageId, data);
  
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
  const stage = await stagesRepository.getStageById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(stage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_UPDATE');
  }
  
  // Verificar WIP limit si existe
  const currentTaskCount = (stage.taskIds || []).length;
  if (stage.wipLimit !== null && currentTaskCount >= stage.wipLimit) {
    throw new Error('WIP_LIMIT_REACHED');
  }
  
  // Verificar que la tarea no esté ya en la etapa
  if ((stage.taskIds || []).includes(taskId)) {
    throw new Error('TASK_ALREADY_IN_STAGE');
  }
  
  // Agregar tarea a la lista
  const updatedTaskIds = [...(stage.taskIds || []), taskId];
  const updated = await stagesRepository.updateStage(stageId, {
    taskIds: updatedTaskIds,
    updatedAt: new Date()
  });
  
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
  const stage = await stagesRepository.getStageById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(stage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_UPDATE');
  }
  
  // Verificar que la tarea está en la etapa
  if (!(stage.taskIds || []).includes(taskId)) {
    throw new Error('TASK_NOT_IN_STAGE');
  }
  
  // Remover tarea de la lista
  const updatedTaskIds = (stage.taskIds || []).filter(id => id !== taskId);
  const updated = await stagesRepository.updateStage(stageId, {
    taskIds: updatedTaskIds,
    updatedAt: new Date()
  });
  
  return removeSensitiveFields({
    id: updated.id,
    name: updated.name,
    taskIds: updated.taskIds || []
  });
};

//MOVER TAREA ENTRE ETAPAS
export const moveTaskBetweenStages = async (taskId, fromStageId, toStageId, userId) => {
  // Verificar que ambas etapas existen
  const fromStage = await stagesRepository.getStageById(fromStageId);
  const toStage = await stagesRepository.getStageById(toStageId);
  
  if (!fromStage || !toStage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que pertenecen al mismo equipo
  if (fromStage.teamId !== toStage.teamId) {
    throw new Error('STAGES_FROM_DIFFERENT_TEAMS');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(fromStage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_UPDATE');
  }
  
  // Verificar WIP limit de la etapa destino
  const toStageTaskCount = (toStage.taskIds || []).length;
  if (toStage.wipLimit !== null && toStageTaskCount >= toStage.wipLimit) {
    throw new Error('DESTINATION_WIP_LIMIT_REACHED');
  }
  
  // Remover de etapa origen
  const fromUpdatedTaskIds = (fromStage.taskIds || []).filter(id => id !== taskId);
  await stagesRepository.updateStage(fromStageId, {
    taskIds: fromUpdatedTaskIds,
    updatedAt: new Date()
  });
  
  // Agregar a etapa destino
  const toUpdatedTaskIds = [...(toStage.taskIds || []), taskId];
  const updatedToStage = await stagesRepository.updateStage(toStageId, {
    taskIds: toUpdatedTaskIds,
    updatedAt: new Date()
  });
  
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
  const stage = await stagesRepository.getStageById(stageId);
  
  if (!stage) {
    throw new Error('STAGE_NOT_FOUND');
  }
  
  // Verificar que el usuario pertenece al equipo
  const team = await teamsRepository.getTeamById(stage.teamId);
  if (!team || !team.members.includes(userId)) {
    throw new Error('UNAUTHORIZED_STAGE_DELETE');
  }
  
  // Verificar que la etapa no tenga tareas
  if ((stage.taskIds || []).length > 0) {
    throw new Error('STAGE_HAS_TASKS');
  }
  
  // Soft delete (borrado lógico)
  const deleted = await stagesRepository.softDeleteStage(stageId);
  
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