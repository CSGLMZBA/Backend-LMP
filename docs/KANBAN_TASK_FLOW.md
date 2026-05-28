# Kanban y Estado de Tareas

Este documento define el contrato entre frontend y backend para mover tareas en el tablero Kanban.

## Conceptos

- `task.stageId`: ubicacion visual de la tarea en el tablero Kanban.
- `task.status`: estado logico usado para filtros, reportes y dashboard.
- `stage.mappedStatus`: estado logico opcional que se aplica cuando una tarea entra a esa columna.

## Endpoint recomendado para drag and drop

El frontend debe mover tareas con:

```http
POST /api/stages/tasks/move
```

Body:

```json
{
  "taskId": "task123",
  "fromStageId": "stageA",
  "toStageId": "stageB"
}
```

Este endpoint actualiza en una sola operacion:

- `task.stageId`
- `stage.taskIds` de origen
- `stage.taskIds` de destino
- `task.status`, si el stage destino tiene `mappedStatus`
- `task.statusHistory`, cuando cambia el status por `mappedStatus`

Tambien valida:

- que ambos stages existan
- que ambos stages pertenezcan al mismo equipo
- que ambos stages pertenezcan al mismo chart
- que la tarea pertenezca al mismo equipo/chart
- que se respete el WIP limit del stage destino

## Edicion de tarea

`PUT /api/tasks/:id` se usa para editar datos generales de una tarea:

- nombre
- descripcion
- prioridad
- fechas
- asignados
- bloqueo
- tags

Aunque el backend soporta `stageId` en `PUT /api/tasks/:id` como respaldo tecnico, el frontend no debe usarlo como flujo principal de drag and drop.

## Cambio logico de status

Para cambiar el estado logico sin mover la tarea de columna:

```http
PATCH /api/tasks/:id/status
```

Este endpoint no mueve la tarea en el Kanban.

## Stages default

Los stages default sincronizan status asi:

- `To Do` -> `PENDING`
- `In Progress` -> `IN_PROGRESS`
- `Review` -> `REVIEW`
- `Done` -> `COMPLETED`
