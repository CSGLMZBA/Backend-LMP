import { z } from 'zod';

// Esquema para crear una tarea
export const createTaskSchema = z.object({
  // Campos obligatorios
  name: z.string().min(1, 'Task name is required').max(200, 'Task name must be less than 200 characters'),
  teamId: z.string().min(1, 'Team ID is required'),
  
  // Campos opcionales con valores por defecto
  chartId: z.string().optional().nullable(),
  stageId: z.string().optional().nullable(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().default(''),
  
  // Asignaciones - array de IDs de usuarios
  assignedUserIds: z.array(z.string()).optional().default([]),
  
  // Prioridad: 1=Baja, 2=Media, 3=Alta, 4=Urgente
  priority: z.number().int().min(1, 'Priority must be between 1 and 4').max(4, 'Priority must be between 1 and 4').optional().default(2),
  
  // Fechas
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  
  // Tiempo estimado (en horas)
  timeEstimate: z.number().positive('Time estimate must be positive').optional().nullable(),
  
  // Subtareas
  parentTaskId: z.string().optional().nullable(),
  
  // Etiquetas
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional().default([]),
  
  // Archivos adjuntos
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number().positive()
  })).optional().default([]),
  
  // Bloqueo (opcional)
  isBlocked: z.boolean().optional().default(false),
  blockedReason: z.string().max(500, 'Blocked reason must be less than 500 characters').optional().nullable(),
});

// actualizar una tarea
export const updateTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200, 'Task name must be less than 200 characters').optional(),
  chartId: z.string().optional().nullable(),
  stageId: z.string().optional().nullable(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  assignedUserIds: z.array(z.string()).optional(),
  priority: z.number().int().min(1, 'Priority must be between 1 and 4').max(4, 'Priority must be between 1 and 4').optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  timeEstimate: z.number().positive('Time estimate must be positive').optional().nullable(),
  timeSpent: z.number().min(0, 'Time spent cannot be negative').optional(),
  parentTaskId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number().positive()
  })).optional(),
  isBlocked: z.boolean().optional(),
  blockedReason: z.string().max(500, 'Blocked reason must be less than 500 characters').optional().nullable(),
});

// actualizar el ESTADO de una tarea
export const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be: PENDING, IN_PROGRESS, REVIEW, COMPLETED, or CANCELLED' })
  }),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional().default(''),
});

// asignar usuarios a una tarea
export const assignUsersToTaskSchema = z.object({
  userIds: z.array(z.string().min(1, 'User ID is required')).min(1, 'At least one user must be assigned'),
});

// filtrar tareas
export const getTasksQuerySchema = z.object({
  teamId: z.string().optional(),
  stageId: z.string().optional(),
  priority: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(4)).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  assignedTo: z.string().optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).optional().default('20'),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(0)).optional().default('0'),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Esquema para validar ID de tarea en parámetros
export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const teamIdParamSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
});

export const teamStageParamsSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  stageId: z.string().min(1, 'Stage ID is required'),
});

export const teamPriorityParamsSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  priority: z.string()
    .transform((value) => parseInt(value, 10))
    .pipe(z.number().int().min(1).max(4)),
});

// Esquema para operaciones batch (múltiples tareas)
export const batchUpdateTasksSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'At least one task ID is required'),
  updateData: z.object({
    stageId: z.string().optional(),
    priority: z.number().int().min(1).max(4).optional(),
    assignedUserIds: z.array(z.string()).optional(),
  }),
});

// ============ CONSTANTES ============

export const TASK_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
};

export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const TASK_STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const TASK_PRIORITY_LABELS = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent'
};

export const TASK_PRIORITY_COLORS = {
  1: 'green',
  2: 'blue',
  3: 'orange',
  4: 'red'
};

export const TASK_STATUS_COLORS = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  REVIEW: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'red'
};
