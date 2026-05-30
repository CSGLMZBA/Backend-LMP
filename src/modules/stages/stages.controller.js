import * as stagesService from './stages.service.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';

const stageTaskRelationErrors = {
  CHART_NOT_FOUND: ['Chart not found', 404],
  CHART_TEAM_MISMATCH: ['Chart does not belong to this team', 400],
  TASK_NOT_FOUND: ['Task not found', 404],
  TASK_STAGE_TEAM_MISMATCH: ['Task and stage must belong to the same team', 400],
  TASK_STAGE_CHART_MISMATCH: ['Task and stage must belong to the same chart', 400],
  TASK_NOT_IN_SOURCE_STAGE: ['Task is not in the source stage', 400],
  TASK_ALREADY_IN_ANOTHER_STAGE: ['Task is already in another stage', 400],
  STAGES_FROM_DIFFERENT_CHARTS: ['Stages must belong to the same chart', 400],
};

const handleStageTaskRelationError = (res, error) => {
  const relationError = stageTaskRelationErrors[error.message];

  if (!relationError) {
    return null;
  }

  const [message, status] = relationError;
  return errorResponse(res, message, error.message, [], status);
};

// CREAR ETAPA
export const createStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const stage = await stagesService.createStage(
      req.validatedData,
      userId
    );

    await recordAudit({
      action: 'create',
      entityType: 'stage',
      entityId: stage.id,
      userId,
      teamId: stage.teamId,
      chartId: stage.chartId,
      stageId: stage.id,
      details: {
        name: stage.name,
        order: stage.order,
        mappedStatus: stage.mappedStatus,
      },
    });

    return successResponse(
      res,
      'Stage created successfully',
      stage,
      201
    );
  } catch (error) {
    if (error.message === 'STAGE_NAME_REQUIRED') {
      return errorResponse(
        res,
        'Stage name is required',
        'STAGE_NAME_REQUIRED',
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
    if (error.message === 'CHART_ID_REQUIRED') {
      return errorResponse(
        res,
        'Chart ID is required',
        'CHART_ID_REQUIRED',
        [],
        400
      );
    }
    if (error.message === 'CHART_NOT_FOUND') {
      return errorResponse(
        res,
        'Chart not found',
        'CHART_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'CHART_TEAM_MISMATCH') {
      return errorResponse(
        res,
        'Chart does not belong to this team',
        'CHART_TEAM_MISMATCH',
        [],
        400
      );
    }
    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'STAGE_ORDER_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Stage order already exists in this chart',
        'STAGE_ORDER_ALREADY_EXISTS',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to create stages for this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error creating stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// OBTENER ETAPAS POR CHART
export const getStagesByChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chartId, teamId } = req.params;
    
    const stages = await stagesService.getStagesByChart(chartId, teamId, userId);

    return successResponse(
      res,
      'Stages retrieved successfully',
      stages
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to view stages for this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error retrieving stages',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// OBTENER ETAPA POR ID
export const getStageById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stageId } = req.params;
    
    const stage = await stagesService.getStageById(stageId, userId);

    return successResponse(
      res,
      'Stage retrieved successfully',
      stage
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to view this stage',
        'UNAUTHORIZED_STAGE_ACCESS',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error retrieving stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// ACTUALIZAR ETAPA
export const updateStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stageId } = req.params;
    const data = req.validatedData;
    
    const stage = await stagesService.updateStage(stageId, data, userId);

    await recordAudit({
      action: 'update',
      entityType: 'stage',
      entityId: stage.id,
      userId,
      teamId: stage.teamId,
      chartId: stage.chartId,
      stageId: stage.id,
      details: {
        fields: Object.keys(data),
      },
    });

    return successResponse(
      res,
      'Stage updated successfully',
      stage
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'STAGE_NAME_REQUIRED') {
      return errorResponse(
        res,
        'Stage name is required',
        'STAGE_NAME_REQUIRED',
        [],
        400
      );
    }
    if (error.message === 'WIP_LIMIT_INVALID') {
      return errorResponse(
        res,
        'WIP limit must be 0 or greater',
        'WIP_LIMIT_INVALID',
        [],
        400
      );
    }
    if (error.message === 'STAGE_ORDER_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Stage order already exists in this chart',
        'STAGE_ORDER_ALREADY_EXISTS',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to update this stage',
        'UNAUTHORIZED_STAGE_UPDATE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error updating stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

export const reorderStages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chartId, teamId } = req.params;
    const { stageIds } = req.validatedData;

    const stages = await stagesService.reorderStages(
      chartId,
      teamId,
      stageIds,
      userId
    );

    await recordAudit({
      action: 'reorder',
      entityType: 'chart_stages',
      entityId: chartId,
      userId,
      teamId,
      chartId,
      details: {
        stageIds,
      },
    });

    return successResponse(
      res,
      'Stages reordered successfully',
      stages
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'CHART_NOT_FOUND') {
      return errorResponse(
        res,
        'Chart not found',
        'CHART_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'CHART_TEAM_MISMATCH') {
      return errorResponse(
        res,
        'Chart does not belong to this team',
        'CHART_TEAM_MISMATCH',
        [],
        400
      );
    }
    if (error.message === 'STAGE_ORDER_INVALID') {
      return errorResponse(
        res,
        'Stage order list must include every active stage exactly once',
        'STAGE_ORDER_INVALID',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to reorder stages',
        'UNAUTHORIZED_STAGE_UPDATE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error reordering stages',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// AGREGAR TAREA A ETAPA
export const addTaskToStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stageId } = req.params;
    const { taskId } = req.validatedData;
    
    const stage = await stagesService.addTaskToStage(stageId, taskId, userId);

    await recordAudit({
      action: 'add_task',
      entityType: 'stage_task',
      entityId: taskId,
      userId,
      teamId: stage.teamId,
      chartId: stage.chartId,
      stageId: stage.id,
      taskId,
      details: {
        stageId: stage.id,
      },
    });

    return successResponse(
      res,
      'Task added to stage successfully',
      stage
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'WIP_LIMIT_REACHED') {
      return errorResponse(
        res,
        'Work in progress limit reached for this stage',
        'WIP_LIMIT_REACHED',
        [],
        400
      );
    }
    if (error.message === 'TASK_ALREADY_IN_STAGE') {
      return errorResponse(
        res,
        'Task is already in this stage',
        'TASK_ALREADY_IN_STAGE',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to modify this stage',
        'UNAUTHORIZED_STAGE_UPDATE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error adding task to stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// REMOVER TAREA DE ETAPA
export const removeTaskFromStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stageId, taskId } = req.params;
    
    const stage = await stagesService.removeTaskFromStage(stageId, taskId, userId);

    await recordAudit({
      action: 'remove_task',
      entityType: 'stage_task',
      entityId: taskId,
      userId,
      teamId: stage.teamId,
      chartId: stage.chartId,
      stageId: stage.id,
      taskId,
      details: {
        stageId: stage.id,
      },
    });

    return successResponse(
      res,
      'Task removed from stage successfully',
      stage
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'TASK_NOT_IN_STAGE') {
      return errorResponse(
        res,
        'Task is not in this stage',
        'TASK_NOT_IN_STAGE',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to modify this stage',
        'UNAUTHORIZED_STAGE_UPDATE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error removing task from stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// MOVER TAREA ENTRE ETAPAS
export const moveTaskBetweenStages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, fromStageId, toStageId } = req.validatedData;
    
    const result = await stagesService.moveTaskBetweenStages(
      taskId,
      fromStageId,
      toStageId,
      userId
    );

    await recordAudit({
      action: 'move_task',
      entityType: 'stage_task',
      entityId: taskId,
      userId,
      teamId: result.teamId,
      chartId: result.chartId,
      taskId,
      details: {
        fromStageId,
        toStageId,
        status: result.task.status,
      },
    });

    return successResponse(
      res,
      'Task moved successfully',
      result
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'STAGES_FROM_DIFFERENT_TEAMS') {
      return errorResponse(
        res,
        'Stages must belong to the same team',
        'STAGES_FROM_DIFFERENT_TEAMS',
        [],
        400
      );
    }
    if (error.message === 'DESTINATION_WIP_LIMIT_REACHED') {
      return errorResponse(
        res,
        'Work in progress limit reached in destination stage',
        'DESTINATION_WIP_LIMIT_REACHED',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to move tasks',
        'UNAUTHORIZED_STAGE_UPDATE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error moving task',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// ELIMINAR ETAPA
export const deleteStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stageId } = req.params;
    
    const result = await stagesService.deleteStage(stageId, userId);

    await recordAudit({
      action: 'delete',
      entityType: 'stage',
      entityId: result.stageId,
      userId,
      teamId: result.teamId,
      chartId: result.chartId,
      stageId: result.stageId,
      details: {
        softDelete: true,
      },
    });

    return successResponse(
      res,
      'Stage deleted successfully',
      result
    );
  } catch (error) {
    const relationError = handleStageTaskRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'STAGE_NOT_FOUND') {
      return errorResponse(
        res,
        'Stage not found',
        'STAGE_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'STAGE_HAS_TASKS') {
      return errorResponse(
        res,
        'Cannot delete stage that has tasks',
        'STAGE_HAS_TASKS',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_STAGE_DELETE') {
      return errorResponse(
        res,
        'You do not have permission to delete this stage',
        'UNAUTHORIZED_STAGE_DELETE',
        [],
        403
      );
    }
    return errorResponse(
      res,
      'Error deleting stage',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};

// CREAR ETAPAS POR DEFECTO
export const createDefaultStages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chartId, teamId } = req.validatedData;
    
    const stages = await stagesService.createDefaultStages(chartId, teamId, userId);

    await recordAudit({
      action: 'create_default',
      entityType: 'chart_stages',
      entityId: chartId,
      userId,
      teamId,
      chartId,
      details: {
        stageIds: stages.map((stage) => stage.id),
      },
    });

    return successResponse(
      res,
      'Default stages created successfully',
      stages,
      201
    );
  } catch (error) {
    if (error.message === 'TEAM_NOT_FOUND') {
      return errorResponse(
        res,
        'Team not found',
        'TEAM_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'STAGE_ORDER_ALREADY_EXISTS') {
      return errorResponse(
        res,
        'Stage order already exists in this chart',
        'STAGE_ORDER_ALREADY_EXISTS',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_TEAM_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to create stages for this team',
        'UNAUTHORIZED_TEAM_ACCESS',
        [],
        403
      );
    }
    if (error.message === 'CHART_NOT_FOUND') {
      return errorResponse(
        res,
        'Chart not found',
        'CHART_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'CHART_TEAM_MISMATCH') {
      return errorResponse(
        res,
        'Chart does not belong to this team',
        'CHART_TEAM_MISMATCH',
        [],
        400
      );
    }
    if (error.message === 'DEFAULT_STAGES_ALREADY_EXIST') {
      return errorResponse(
        res,
        'Default stages already exist for this chart',
        'DEFAULT_STAGES_ALREADY_EXIST',
        [],
        400
      );
    }
    return errorResponse(
      res,
      'Error creating default stages',
      'INTERNAL_ERROR',
      [error.message],
      500
    );
  }
};
