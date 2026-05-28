import { Router } from 'express';

import * as stagesController from './stages.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { stagesSchema } from './stages.schema.js';

const router = Router();

// Todas las rutas de stages requieren autenticación
router.use(authMiddleware());

// RUTAS PRINCIPALES

// Crear etapa
router.post(
  '/',
  validate(stagesSchema.create),
  stagesController.createStage
);

// Obtener etapas por chart
router.get(
  '/chart/:chartId/team/:teamId',
  validate(stagesSchema.getByChartParams, 'params'),
  stagesController.getStagesByChart
);

router.patch(
  '/chart/:chartId/team/:teamId/order',
  validate(stagesSchema.getByChartParams, 'params'),
  validate(stagesSchema.reorder),
  stagesController.reorderStages
);

// Crear etapas por defecto para un nuevo chart
router.post(
  '/default',
  validate(stagesSchema.createDefaultStages),
  stagesController.createDefaultStages
);

// RUTAS CON ID DE ETAPA

// Obtener etapa por ID
router.get(
  '/:stageId',
  validate(stagesSchema.getByIdParams, 'params'),
  stagesController.getStageById
);

// Actualizar etapa
router.patch(
  '/:stageId',
  validate(stagesSchema.updateParams, 'params'),
  validate(stagesSchema.update),
  stagesController.updateStage
);

// Eliminar etapa (soft delete)
router.delete(
  '/:stageId',
  validate(stagesSchema.deleteParams, 'params'),
  stagesController.deleteStage
);

// MANEJO DE TAREAS EN ETAPAS

// Agregar tarea a etapa
router.post(
  '/:stageId/tasks',
  validate(stagesSchema.addTaskParams, 'params'),
  validate(stagesSchema.addTask),
  stagesController.addTaskToStage
);

// Remover tarea de etapa
router.delete(
  '/:stageId/tasks/:taskId',
  validate(stagesSchema.removeTaskParams, 'params'),
  stagesController.removeTaskFromStage
);

// Mover tarea entre etapas
router.post(
  '/tasks/move',
  validate(stagesSchema.moveTask),
  stagesController.moveTaskBetweenStages
);

export default router;
