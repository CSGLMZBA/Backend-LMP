import { z } from 'zod';

const mappedStatusSchema = z
  .enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'])
  .nullable()
  .optional();

export const stagesSchema = {
  //  CREAR ETAPA
  create: z.object({
    name: z.string().min(1, 'Stage name is required').max(100, 'Stage name must be less than 100 characters'),
    teamId: z.string().min(1, 'Team ID is required'),
    chartId: z.string().min(1, 'Chart ID is required'),
    taskIds: z.array(z.string()).optional().default([]),
    wipLimit: z.number().int().min(0, 'WIP limit must be 0 or greater').nullable().optional().default(null),
    order: z.number().int().min(0, 'Order must be 0 or greater').optional(),
    mappedStatus: mappedStatusSchema.default(null),
  }),

  //OBTENER ETAPAS POR CHART
  getByChartParams: z.object({
    chartId: z.string().min(1, 'Chart ID is required'),
    teamId: z.string().min(1, 'Team ID is required'),
  }),

  // OBTENER ETAPA POR ID
  getByIdParams: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
  }),

  // ACTUALIZAR ETAPA
  updateParams: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
  }),

  update: z.object({
    name: z.string().min(1, 'Stage name is required').max(100, 'Stage name must be less than 100 characters').optional(),
    wipLimit: z.number().int().min(0, 'WIP limit must be 0 or greater').nullable().optional(),
    order: z.number().int().min(0, 'Order must be 0 or greater').optional(),
    mappedStatus: mappedStatusSchema,
    isArchived: z.boolean().optional(),
  }),

  reorder: z.object({
    stageIds: z.array(z.string().min(1, 'Stage ID is required'))
      .min(1, 'At least one stage ID is required'),
  }),

  // AGREGAR TAREA A ETAPA 
  addTaskParams: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
  }),

  addTask: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
  }),

  // REMOVER TAREA DE ETAPA
  removeTaskParams: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
    taskId: z.string().min(1, 'Task ID is required'),
  }),

  // MOVER TAREA ENTRE ETAPAS
  moveTask: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    fromStageId: z.string().min(1, 'Source stage ID is required'),
    toStageId: z.string().min(1, 'Destination stage ID is required'),
  }),

  // ELIMINAR ETAPA
  deleteParams: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
  }),

  // CREAR ETAPAS POR DEFECTO
  createDefaultStages: z.object({
    chartId: z.string().min(1, 'Chart ID is required'),
    teamId: z.string().min(1, 'Team ID is required'),
  }),

  // QUERY PARAMS PARA FILTRAR
  query: z.object({
    teamId: z.string().optional(),
    chartId: z.string().optional(),
    isArchived: z.string().transform(val => val === 'true').optional(),
  }),
};

// Constantes útiles
export const DEFAULT_STAGES = [
  { name: 'To Do', wipLimit: null, mappedStatus: 'PENDING', order: 0 },
  { name: 'In Progress', wipLimit: 5, mappedStatus: 'IN_PROGRESS', order: 1 },
  { name: 'Review', wipLimit: 3, mappedStatus: 'REVIEW', order: 2 },
  { name: 'Done', wipLimit: null, mappedStatus: 'COMPLETED', order: 3 }
];

export const STAGE_ERRORS = {
  STAGE_NAME_REQUIRED: 'Stage name is required',
  TEAM_ID_REQUIRED: 'Team ID is required',
  CHART_ID_REQUIRED: 'Chart ID is required',
  TEAM_NOT_FOUND: 'Team not found',
  STAGE_NOT_FOUND: 'Stage not found',
  UNAUTHORIZED_TEAM_ACCESS: 'You do not have permission to access this team',
  UNAUTHORIZED_STAGE_ACCESS: 'You do not have permission to access this stage',
  UNAUTHORIZED_STAGE_UPDATE: 'You do not have permission to update this stage',
  UNAUTHORIZED_STAGE_DELETE: 'You do not have permission to delete this stage',
  WIP_LIMIT_REACHED: 'Work in progress limit reached for this stage',
  DESTINATION_WIP_LIMIT_REACHED: 'Work in progress limit reached in destination stage',
  WIP_LIMIT_INVALID: 'WIP limit must be 0 or greater',
  STAGE_ORDER_ALREADY_EXISTS: 'Stage order already exists in this chart',
  STAGE_ORDER_INVALID: 'Stage order list must include every active stage exactly once',
  DEFAULT_STAGES_ALREADY_EXIST: 'Default stages already exist for this chart',
  TASK_ALREADY_IN_STAGE: 'Task is already in this stage',
  TASK_NOT_IN_STAGE: 'Task is not in this stage',
  STAGE_HAS_TASKS: 'Cannot delete stage that has tasks',
  STAGES_FROM_DIFFERENT_TEAMS: 'Stages must belong to the same team',
};
