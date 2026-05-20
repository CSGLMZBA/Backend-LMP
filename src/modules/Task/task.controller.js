import * as tasksService from './task.service.js';
import { successResponse, errorResponse, } from '../../utils/response.js';

// ============ CREAR TAREA ============
export const createTask = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const task = await tasksService.createTask(
      req.validatedData,
      userId
    );

    return successResponse(
      res,
      'Task created successfully',
      task,
      201
    );
  } catch (error) {
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
    return errorResponse(res, 'Error creating task');
  }
};

// ============ OBTENER TAREAS POR EQUIPO ============
export const getTasksByTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    
    const tasks = await tasksService.getTasksByTeam(teamId, userId);

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
    const { teamId } = req.query; // Opcional: filtrar por equipo
    
    const tasks = await tasksService.getTasksByUser(userId, teamId);

    return successResponse(
      res,
      'My tasks retrieved successfully',
      tasks
    );
  } catch (error) {
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

    return successResponse(
      res,
      'Task updated successfully',
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
    if (error.message === 'UNAUTHORIZED_UPDATE') {
      return errorResponse(
        res,
        'You do not have permission to update this task',
        'UNAUTHORIZED_UPDATE',
        [],
        403
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
    return errorResponse(res, 'Error assigning users to task');
  }
};

// ============ ELIMINAR TAREA (soft delete) ============
export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await tasksService.deleteTask(id, userId);

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