import express from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignUsersToTaskSchema,
  taskIdParamSchema,
  getTasksQuerySchema,
  teamIdParamSchema,
  teamStageParamsSchema,
  teamPriorityParamsSchema,
} from './task.schema.js';
import * as tasksController from './task.controller.js';
import * as commentsController from './comments/comments.controller.js';
import * as commentsSchema from './comments/comments.schema.js'

const router = express.Router();

router.use(authMiddleware(2));

// ============ RUTAS PRINCIPALES ============

// Obtener tareas del usuario
router.get(
  '/my-tasks',
  validate(getTasksQuerySchema, 'query'),
  tasksController.getMyTasks
);

// Crear nueva tarea
router.post(
  '/',
  validate(createTaskSchema),
  tasksController.createTask
);

// Obtener tareas por equipo
router.get(
  '/team/:teamId',
  validate(teamIdParamSchema, 'params'),
  tasksController.getTasksByTeam
);

// Obtener tareas por etapa (para Kanban)
router.get(
  '/team/:teamId/stage/:stageId',
  validate(teamStageParamsSchema, 'params'),
  tasksController.getTasksByStage
);

// Obtener tareas por prioridad
router.get(
  '/team/:teamId/priority/:priority',
  validate(teamPriorityParamsSchema, 'params'),
  tasksController.getTasksByPriority
);

// ============ RUTAS CON ID DE TAREA ============

// Obtener tarea por ID
router.get(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  tasksController.getTaskById
);

// Actualizar tarea
router.put(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  tasksController.updateTask
);

// Actualizar estado de tarea
router.patch(
  '/:id/status',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskStatusSchema),
  tasksController.updateTaskStatus
);

// Asignar usuarios a tarea
router.post(
  '/:id/assign',
  validate(taskIdParamSchema, 'params'),
  validate(assignUsersToTaskSchema),
  tasksController.assignUsersToTask
);

// Poner un comentario en la tarea
router.post(
  '/:id/comments',
  validate(commentsSchema.postParams, 'params'),
  validate(commentsSchema.comment),
  commentsController.postComment
);

// Obtener los comentarios de la tarea
router.get(
  '/:id/comments',
  validate(commentsSchema.getParams, 'params'),
  commentsController.getCommentsByTaskId
);

// Borrar los comentarios de la tarea
router.delete(
  '/:id/comments/:commentId',
  validate(commentsSchema.deleteParams, 'params'),
  commentsController.deleteCommentById
);

// Eliminar tarea (soft delete)
router.delete(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  tasksController.deleteTask
);

export default router;
