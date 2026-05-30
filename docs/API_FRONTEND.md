# API Frontend

Documento de consumo para el frontend de TaskFlow.

Base URL local sugerida:

```txt
http://localhost:3000/api
```

Todas las respuestas exitosas usan:

```json
{
  "success": true,
  "message": "Mensaje",
  "data": {}
}
```

Todas las respuestas de error usan:

```json
{
  "success": false,
  "message": "Mensaje",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

## Autenticacion

Enviar token en rutas privadas:

```http
Authorization: Bearer <accessToken>
```

Roles globales:

- `admin`: administracion del sistema.
- `user`: usuario operativo que puede crear equipos.
- `client`: usuario cliente, no crea equipos.

Roles de equipo:

- `OWNER`
- `MANAGER`
- `MEMBER`
- `CLIENT`

La autorizacion importante para equipos/proyectos/tareas depende del rol en `team_members`, no solo del rol global.

## Timestamps

El backend normaliza los timestamps de salida a strings ISO 8601.

Ejemplo:

```json
{
  "createdAt": "2026-05-30T18:25:43.511Z",
  "updatedAt": "2026-05-30T18:30:01.000Z"
}
```

El frontend debe tratarlos como strings ISO y formatearlos en UI segun locale.

## Auth

### POST `/api/auth/register`

Publica.

Body:

```json
{
  "displayName": "Isa",
  "userName": "isa",
  "email": "isa@example.com",
  "password": "Password123!",
  "role": "client"
}
```

Notas:

- Si no se manda `role`, el default es `user`.
- El registro publico no debe crear admins.

### POST `/api/auth/login`

Publica.

Body:

```json
{
  "email": "isa@example.com",
  "password": "Password123!"
}
```

Respuesta esperada:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {}
}
```

### POST `/api/auth/refresh`

Publica.

### POST `/api/auth/logout`

Privada.

### GET `/api/auth/me`

Privada. Devuelve el usuario autenticado.

### PATCH `/api/auth/change-password`

Privada.

## Usuarios

### GET `/api/users/search?userName=<texto>`

Privada. Busca usuarios por username.

### GET `/api/users/list`

Privada. Lista usuarios basicos para selects.

### Endpoints admin

Requieren rol global admin:

- `GET /api/users`
- `GET /api/users/:userId`
- `POST /api/users`
- `PUT /api/users/:userId`
- `PATCH /api/users/:userId/status`
- `PATCH /api/users/:userId/unlock`
- `DELETE /api/users/:userId`

## Equipos

### GET `/api/teams`

Privada. Lista equipos donde participa el usuario.

### POST `/api/teams`

Privada. Solo global `user` o `admin`.

Body:

```json
{
  "name": "Equipo A",
  "description": "Equipo escolar",
  "password": "equipo123"
}
```

### GET `/api/teams/:teamId`

Privada. Requiere membresia.

### PATCH `/api/teams/:teamId`

Privada. Requiere `OWNER` o `MANAGER`.

### DELETE `/api/teams/:teamId`

Privada. Archiva el equipo. Requiere `OWNER` o `MANAGER`.

### POST `/api/teams/:teamId/join`

Privada.

Body:

```json
{
  "password": "equipo123"
}
```

### Miembros

- `GET /api/teams/:teamId/members`
- `POST /api/teams/:teamId/members`
- `PATCH /api/teams/:teamId/members/:userId/role`
- `DELETE /api/teams/:teamId/members/:userId`

Respuesta de miembros:

```json
[
  {
    "id": "team-member-id",
    "teamId": "team-id",
    "userId": "user-id",
    "role": "MEMBER",
    "user": {
      "id": "user-id",
      "userName": "isa",
      "displayName": "Isa",
      "email": "isa@example.com"
    }
  }
]
```

Body para agregar miembro:

```json
{
  "userId": "user-id",
  "role": "MEMBER"
}
```

Body para cambiar rol:

```json
{
  "role": "MANAGER"
}
```

Regla: no se puede remover ni degradar al ultimo `OWNER`.

## Proyectos

### GET `/api/projects`

Privada. Lista proyectos visibles para el usuario.

Query params:

- `teamId`
- `status`: `ACTIVE` o `ARCHIVED`
- `search`
- `ownerId`

### POST `/api/projects`

Privada. Requiere rol de equipo suficiente.

Body:

```json
{
  "name": "Proyecto final",
  "description": "TaskFlow",
  "teamId": "team-id"
}
```

### GET `/api/projects/:projectId`

Incluye detalle con charts y resumen de tareas.

### PATCH `/api/projects/:projectId`

Actualiza datos generales.

### PATCH `/api/projects/:projectId/status`

Body:

```json
{
  "status": "ARCHIVED"
}
```

### DELETE `/api/projects/:projectId`

Soft delete.

## Dashboard

### GET `/api/dashboard/summary`

Privada. Devuelve resumen global visible para el usuario:

- equipos
- proyectos
- tareas totales
- tareas por status
- tareas vencidas
- tareas asignadas al usuario
- resumen por proyecto

## Charts

### GET `/api/charts`

Privada. Lista charts de equipos del usuario.

### POST `/api/charts`

Privada. Requiere global `user/admin` y rol de equipo `OWNER/MANAGER`.

Body:

```json
{
  "name": "Kanban principal",
  "teamId": "team-id",
  "projectId": "project-id"
}
```

Notas:

- `projectId` es obligatorio.
- Al crear chart sin stages, se crean stages default.

### GET `/api/charts/:chartId`

### PATCH `/api/charts/:chartId`

### DELETE `/api/charts/:chartId`

Archiva el chart y sus stages activos.

## Stages

### GET `/api/stages/chart/:chartId/team/:teamId`

Lista columnas Kanban ordenadas por `order`.

### POST `/api/stages`

Body:

```json
{
  "name": "Review",
  "teamId": "team-id",
  "chartId": "chart-id",
  "wipLimit": 3,
  "order": 2,
  "mappedStatus": "REVIEW"
}
```

### POST `/api/stages/default`

Crea las columnas default si el chart no tiene stages activos.

Body:

```json
{
  "chartId": "chart-id",
  "teamId": "team-id"
}
```

### PATCH `/api/stages/chart/:chartId/team/:teamId/order`

Body:

```json
{
  "stageIds": ["stage-1", "stage-2", "stage-3"]
}
```

Debe incluir todos los stages activos del chart exactamente una vez.

### POST `/api/stages/tasks/move`

Endpoint recomendado para mover tareas en Kanban.

Body:

```json
{
  "taskId": "task-id",
  "fromStageId": "stage-origen",
  "toStageId": "stage-destino"
}
```

Notas:

- Actualiza `task.stageId`.
- Actualiza `stage.taskIds`.
- Si el stage destino tiene `mappedStatus`, sincroniza `task.status`.

Otros endpoints:

- `GET /api/stages/:stageId`
- `PATCH /api/stages/:stageId`
- `DELETE /api/stages/:stageId`
- `POST /api/stages/:stageId/tasks`
- `DELETE /api/stages/:stageId/tasks/:taskId`

## Tareas

### GET `/api/tasks/my-tasks`

Lista tareas asignadas al usuario autenticado.

Query params:

- `teamId`
- `projectId`
- `stageId`
- `priority`: `1`, `2`, `3`, `4`
- `status`: `PENDING`, `IN_PROGRESS`, `REVIEW`, `COMPLETED`, `CANCELLED`
- `assignedTo`
- `search`
- `limit`
- `offset`
- `sortBy`: `createdAt`, `dueDate`, `priority`, `status`
- `sortOrder`: `asc`, `desc`

### GET `/api/tasks/team/:teamId`

Lista tareas del equipo. Acepta los mismos query params.

### GET `/api/tasks/team/:teamId/stage/:stageId`

Lista tareas por columna Kanban.

### GET `/api/tasks/team/:teamId/priority/:priority`

Lista tareas por prioridad.

### POST `/api/tasks`

Body:

```json
{
  "name": "Crear pantalla de login",
  "teamId": "team-id",
  "projectId": "project-id",
  "chartId": "chart-id",
  "stageId": "stage-id",
  "description": "Login con JWT",
  "assignedUserIds": ["user-id"],
  "priority": 2,
  "dueDate": "2026-06-15T23:59:00.000Z",
  "tags": ["frontend"]
}
```

### GET `/api/tasks/:id`

### PUT `/api/tasks/:id`

Actualiza datos generales. Tambien puede actualizar `stageId`, pero para Kanban se recomienda usar `/api/stages/tasks/move`.

### PATCH `/api/tasks/:id/status`

Cambia estado logico sin mover columna.

Body:

```json
{
  "status": "REVIEW",
  "comment": "Lista para revision"
}
```

### POST `/api/tasks/:id/assign`

Body:

```json
{
  "userIds": ["user-id-1", "user-id-2"]
}
```

### DELETE `/api/tasks/:id`

Soft delete.

## Comentarios

Todos cuelgan de tarea:

- `GET /api/tasks/:id/comments`
- `GET /api/tasks/:id/comments/:commentId`
- `POST /api/tasks/:id/comments`
- `PUT /api/tasks/:id/comments/:commentId`
- `PATCH /api/tasks/:id/comments/:commentId`
- `DELETE /api/tasks/:id/comments/:commentId`

Body:

```json
{
  "content": "Comentario de prueba"
}
```

Permisos:

- Ver/comentar: miembro del equipo de la tarea.
- Editar/eliminar: autor del comentario u `OWNER/MANAGER`.

## Notificaciones

### GET `/api/notifications`

Lista notificaciones del usuario autenticado.

### GET `/api/notifications/:notificationId`

### PATCH `/api/notifications/read-all`

Marca todas como leidas.

### PATCH `/api/notifications/:notificationId/read`

### PATCH `/api/notifications/:notificationId/unread`

### DELETE `/api/notifications/:notificationId`

Soft delete.

Las notificaciones se crean automaticamente al:

- crear tarea con asignados
- asignar usuarios a tarea
- cambiar status de tarea

## Auditoria y Permisos

### GET `/api/audit`

Solo global `admin`.

### GET `/api/permissions`

Solo global `admin`.

## Flujo Kanban Recomendado

1. Crear equipo.
2. Crear proyecto con `teamId`.
3. Crear chart con `teamId` y `projectId`.
4. Consultar stages del chart.
5. Crear tareas con `teamId`, `projectId`, `chartId`, `stageId`.
6. Mover tareas con `POST /api/stages/tasks/move`.
7. Cambiar status logico solo con `PATCH /api/tasks/:id/status` cuando no sea movimiento visual.

## Errores Comunes

- `TOKEN_REQUIRED`: falta header Authorization.
- `INVALID_TOKEN`: token invalido o expirado.
- `NOT_SUFFICIENT_PERMISSIONS`: rol global insuficiente.
- `UNAUTHORIZED_TEAM_ACCESS`: usuario no pertenece al equipo.
- `INSUFFICIENT_TEAM_ROLE`: rol de equipo insuficiente.
- `PROJECT_TEAM_MISMATCH`: proyecto no pertenece al equipo.
- `CHART_PROJECT_MISMATCH`: chart no pertenece al proyecto.
- `CHART_TEAM_MISMATCH`: chart no pertenece al equipo.
- `STAGE_CHART_MISMATCH`: stage no pertenece al chart.
- `DESTINATION_WIP_LIMIT_REACHED`: limite WIP alcanzado.
