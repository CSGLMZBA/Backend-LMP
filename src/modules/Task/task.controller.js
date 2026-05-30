import * as tasksService from './task.service.js';
import { successResponse, errorResponse, } from '../../utils/response.js';
import { recordAudit } from '../../middleware/audit.middleware.js';

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

// ============ CREAR TAREA ============
export const createTask = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const task = await tasksService.createTask(
      req.validatedData,
      userId
    );

    await recordAudit({
      action: 'create',
      entityType: 'task',
      entityId: task.id,
      userId,
      teamId: task.teamId,
      chartId: task.chartId || '',
      stageId: task.stageId || '',
      taskId: task.id,
      details: {
        projectId: task.projectId,
        assignedUserIds: task.assignedUserIds || [],
        notificationIds: task.notificationIds || [],
      },
    });

    return successResponse(
      res,
      'Task created successfully',
      task,
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

// ============ OBTENER TAREAS POR EQUIPO ============
export const getTasksByTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    const tasks = await tasksService.getTasksByUser(userId, {
      ...req.validatedData,
      teamId,
    });

    return successResponse(
      res,
      'Tasks retrieved successfully',
      tasks
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

// ============ OBTENER TAREAS POR ETAPA (KANBAN) ============
export const getTasksByStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId, stageId } = req.params;
    
    const tasks = await tasksService.getTasksByStage(teamId, stageId, userId);

    return successResponse(
      res,
      'Tasks retrieved successfully',
      tasks
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

// ============ OBTENER MIS TAREAS (usuario autenticado) ============
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await tasksService.getTasksByUser(
      userId,
      req.validatedData
    );

    return successResponse(
      res,
      'My tasks retrieved successfully',
      tasks
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

    return errorResponse(res, 'Error retrieving your tasks');
  }
};

// ============ OBTENER TAREA POR ID ============
export const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const task = await tasksService.getTaskById(id, userId);

    return successResponse(
      res,
      'Task retrieved successfully',
      task
    );
  } catch (error) {
    const relationError = handleRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'TASK_NOT_FOUND') {
      return errorResponse(
        res,
        'Task not found',
        'TASK_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED_TASK_ACCESS') {
      return errorResponse(
        res,
        'You do not have permission to view this task',
        'UNAUTHORIZED_TASK_ACCESS',
        [],
        403
      );
    }
    return errorResponse(res, 'Error retrieving task');
  }
};

// ============ ACTUALIZAR TAREA ============
export const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const updatedTask = await tasksService.updateTask(
      id,
      req.validatedData,
      userId
    );

    await recordAudit({
      action: 'update',
      entityType: 'task',
      entityId: updatedTask.id,
      userId,
      teamId: updatedTask.teamId,
      chartId: updatedTask.chartId || '',
      stageId: updatedTask.stageId || '',
      taskId: updatedTask.id,
      details: {
        projectId: updatedTask.projectId,
        fields: Object.keys(req.validatedData),
        notificationIds: updatedTask.notificationIds || [],
      },
    });

    return successResponse(
      res,
      'Task updated successfully',
      updatedTask
    );
  } catch (error) {
    const relationError = handleRelationError(res, error);
    if (relationError) return relationError;

    if (error.message === 'TASK_NOT_FOUND') {
      return errorResponse(
        res,
        'Task not found',
        'TASK_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'UNAUTHORIZED_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to update this task',
        'UNAUTHORIZED_UPDATE',
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
    return errorResponse(res, 'Error updating task');
  }
};

// ============ ACTUALIZAR ESTADO DE TAREA ============
export const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, comment } = req.validatedData;
    
    const updatedTask = await tasksService.updateTaskStatus(
      id,
      status,
      userId,
      comment
    );

    await recordAudit({
      action: 'status_change',
      entityType: 'task',
      entityId: updatedTask.id,
      userId,
      teamId: updatedTask.teamId,
      chartId: updatedTask.chartId || '',
      stageId: updatedTask.stageId || '',
      taskId: updatedTask.id,
      details: {
        projectId: updatedTask.projectId,
        status: updatedTask.status,
        notificationIds: updatedTask.notificationIds || [],
      },
    });

    return successResponse(
      res,
      'Task status updated successfully',
      updatedTask
    );
  } catch (error) {
    if (error.message === 'TASK_NOT_FOUND') {
      return errorResponse(
        res,
        'Task not found',
        'TASK_NOT_FOUND',
        [],
        404
      );
    }
    if (error.message === 'INVALID_STATUS_TRANSITION') {
      return errorResponse(
        res,
        'Invalid status transition',
        'INVALID_STATUS_TRANSITION',
        [],
        400
      );
    }
    if (error.message === 'UNAUTHORIZED_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to update this task',
        'UNAUTHORIZED_UPDATE',
        [],
        403
      );
    }
    return errorResponse(res, 'Error updating task status');
  }
};

// ============ ASIGNAR USUARIOS A TAREA ============
export const assignUsersToTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { userIds } = req.validatedData;
    
    const updatedTask = await tasksService.assignUsersToTask(
      id,
      userIds,
      userId
    );

    await recordAudit({
      action: 'assign_users',
      entityType: 'task',
      entityId: updatedTask.id,
      userId,
      teamId: updatedTask.teamId,
      chartId: updatedTask.chartId || '',
      stageId: updatedTask.stageId || '',
      taskId: updatedTask.id,
      details: {
        projectId: updatedTask.projectId,
        assignedUserIds: updatedTask.assignedUserIds || [],
        notificationIds: updatedTask.notificationIds || [],
      },
    });

    return successResponse(
      res,
      'Users assigned to task successfully',
      updatedTask
    );
  } catch (error) {
    if (error.message === 'TASK_NOT_FOUND') {
      return errorResponse(
        res,
        'Task not found',
        'TASK_NOT_FOUND',
        [],
        404
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
    if (error.message === 'UNAUTHORIZED_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to assign this task',
        'UNAUTHORIZED_UPDATE',
        [],
        403
      );
    }
    return errorResponse(res, 'Error assigning users to task');
  }
};

// ============ ELIMINAR TAREA (soft delete) ============
export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await tasksService.deleteTask(id, userId);

    await recordAudit({
      action: 'delete',
      entityType: 'task',
      entityId: result.taskId,
      userId,
      teamId: result.teamId,
      chartId: result.chartId || '',
      stageId: result.stageId || '',
      taskId: result.taskId,
      details: {
        projectId: result.projectId,
        softDelete: true,
      },
    });

    return successResponse(
      res,
      'Task deleted successfully',
      result
    );
  } catch (error) {
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
        'You do not have permission to delete this task',
        'UNAUTHORIZED_DELETE',
        [],
        403
      );
    }
    return errorResponse(res, 'Error deleting task');
  }
};

// ============ OBTENER TAREAS POR PRIORIDAD ============
export const getTasksByPriority = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId, priority } = req.params;
    
    const tasks = await tasksService.getTasksByPriority(teamId, parseInt(priority), userId);

    return successResponse(
      res,
      'Tasks retrieved successfully',
      tasks
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
