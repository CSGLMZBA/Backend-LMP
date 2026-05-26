import express from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignUsersToTaskSchema,
  taskIdParamSchema,
  getTasksQuerySchema
} from './task.schema.js';
import * as tasksController from './task.controller.js';

const router = express.Router();

router.use(authMiddleware(2));

// ============ RUTAS PRINCIPALES ============

// Obtener tareas del usuario
router.get('/my-tasks', tasksController.getMyTasks);

// Crear nueva tarea
router.post(
  '/',
  validate(createTaskSchema),
  tasksController.createTask
);

// Obtener tareas por equipo
router.get('/team/:teamId', tasksController.getTasksByTeam);

// Obtener tareas por etapa (para Kanban)
router.get('/team/:teamId/stage/:stageId', tasksController.getTasksByStage);

// Obtener tareas por prioridad
router.get('/team/:teamId/priority/:priority', tasksController.getTasksByPriority);

// ============ RUTAS CON ID DE TAREA ============

// Obtener tarea por ID
router.get('/:id', tasksController.getTaskById);

// Actualizar tarea
router.put(
  '/:id',
  validate(updateTaskSchema),
  tasksController.updateTask
);

// Actualizar estado de tarea
router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  tasksController.updateTaskStatus
);

// Asignar usuarios a tarea
router.post(
  '/:id/assign',
  validate(assignUsersToTaskSchema),
  tasksController.assignUsersToTask
);

// Eliminar tarea (soft delete)
router.delete('/:id', tasksController.deleteTask);

export default router;