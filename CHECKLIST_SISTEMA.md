# Checklist del Sistema Backend

Documento para repartir trabajo entre el equipo sin pisarse.

## Estado Actual

- Rama revisada: `develop`
- Estado del repositorio al revisar: limpio
- Verificacion general: `app import ok`

## Panorama General

Ya existen los modulos principales del backend:

- `auth`
- `users`
- `roles`
- `teams`
- `projects`
- `charts`
- `stages`
- `tasks`
- `audit`

Contratos importantes ya alineados:

- `users.role` es rol global de plataforma:
  - `admin`
  - `user`
  - `client`
- `team_members.role` es la fuente real de permisos por equipo:
  - `OWNER`
  - `MANAGER`
  - `MEMBER`
  - `CLIENT`
- `projects` dependen de `teamId`.
- `charts` dependen de `teamId`.
- `stages` dependen de `chartId` y `teamId`.
- `tasks` usan `teamId`, `chartId` y `stageId`.
- Login lockout y desbloqueo de usuarios ya existen.
- Seed de roles globales ya existe.

---

## Bloque 1: Auth, Usuarios y Roles

### Ya Tenemos

- Registro de usuarios.
- Login.
- Logout.
- Refresh token.
- Endpoint `me`.
- Cambio de password.
- Bloqueo por 5 intentos fallidos de login.
- Desbloqueo administrativo de usuarios.
- CRUD/admin basico de usuarios.
- Registro publico con default `user`.
- Registro publico permite elegir `client`.
- Registro publico no permite crear `admin`.
- Un admin puede crear usuarios `admin`, `user` o `client` desde `POST /users`.
- Rate limit basico en `POST /api/auth/register` y `POST /api/auth/login`.
- Auditoria de auth/users para login, logout, create, update, delete, status_change y cambios sensibles.
- Contrato de auth/usuarios/roles documentado en `docs/AUTH_USERS_ROLES.md`.
- Endpoint `GET /api/permissions` para listar permisos disponibles.
- Roles globales con seed:
  - `admin: 4`
  - `user: 2`
  - `client: 0`

### Falta

- Nada critico por ahora para cerrar este bloque.

### Tareas Pequenas

- Persona A:
  - Documentar endpoints de `auth`.
  - Documentar endpoints de `users`.
  - Documentar endpoints de `roles`.
- Persona B:
  - Endurecer validaciones de `users.routes.js`.
  - Validar parametros en rutas de usuarios.
- Persona C:
  - Probar flujo completo:
    - Register.
    - Login.
    - Lockout.
    - Unlock.
    - Refresh.
    - Logout.

---

## Bloque 2: Equipos y Miembros

### Ya Tenemos

- Crear equipo.
- Unirse a equipo por password.
- Listar equipos del usuario.
- Ver equipo.
- Listar miembros.
- Agregar miembro con rol de equipo.
- Remover miembro.
- Permisos por `team_members`.
- Ya no dependemos de `teams.members`.

### Falta

- Actualizar equipo.
- Archivar/eliminar equipo.
- Cambiar rol de miembro.
- Validar parametros en rutas de equipos.
- Evitar remover al ultimo `OWNER`.
- Revisar si `CLIENT` puede crear equipo o si solo `user/admin`.

### Tareas Pequenas

- Persona A:
  - Crear `PATCH /teams/:teamId`.
  - Crear schema de update de equipo.
  - Validar permisos de `OWNER`/`MANAGER`.
- Persona B:
  - Crear `PATCH /teams/:teamId/members/:userId/role`.
  - Validar roles permitidos:
    - `MANAGER`
    - `MEMBER`
    - `CLIENT`
  - Evitar modificaciones indebidas sobre `OWNER`.
- Persona C:
  - Implementar regla de ultimo `OWNER`.
  - Revisar permisos globales para crear equipos.
  - Definir/implementar status de equipo:
    - `ACTIVE`
    - `INACTIVE`
    - `ARCHIVED`

---

## Bloque 3: Proyectos

### Ya Tenemos

- Crear proyecto por equipo.
- Listar proyectos accesibles por equipos del usuario.
- Ver proyecto.
- Actualizar proyecto.
- Cambiar status.
- Soft delete.

### Falta Importante

- Decidir si `charts` y `tasks` deben colgar de `projectId`.
- Actualmente `projects` existen, pero `charts` y `tasks` no estan realmente amarrados a proyecto.
- Faltan validaciones cruzadas:
  - `project.teamId === chart.teamId`
  - `project.teamId === task.teamId`
  - `chart.teamId === task.teamId`

### Tareas Pequenas

- Persona A:
  - Agregar `projectId` a `charts`.
  - Actualizar schema de chart.
  - Validar que el proyecto exista.
  - Validar que el proyecto pertenezca al mismo equipo.
- Persona B:
  - Agregar `projectId` a `tasks`.
  - Actualizar schema de task.
  - Validar que la tarea pertenezca a un proyecto valido.
- Persona C:
  - Crear queries por proyecto:
    - Charts por proyecto.
    - Tasks por proyecto.
  - Definir respuesta para detalle de proyecto:
    - Proyecto solo.
    - Proyecto con charts.
    - Proyecto con resumen de tareas.

---

## Bloque 4: Charts, Stages y Kanban

### Ya Tenemos

- Crear chart.
- Listar charts del usuario por equipos.
- Ver chart.
- Actualizar chart.
- Crear stages.
- Crear stages default.
- Mover tareas entre stages.
- Sincronizacion basica de `chart.stageIds` al crear/eliminar stages.

### Falta

- Borrar/archivar chart.
- Orden de columnas/stages.
- Evitar stages default duplicadas.
- Validar mejor que cada stage pertenece al chart correcto.
- Definir si el frontend movera tareas por:
  - `/stages/tasks/move`
  - o update de task.

### Tareas Pequenas

- Persona A:
  - Crear `DELETE /charts/:chartId` como soft delete.
  - Validar permisos por equipo.
  - Decidir que pasa con sus stages.
- Persona B:
  - Agregar campo `order` en stages.
  - Crear endpoint para reordenar stages.
  - Validar que no haya ordenes duplicados dentro del mismo chart.
- Persona C:
  - Blindar `createDefaultStages`.
  - Evitar duplicar columnas default.
  - Validar `chartId` + `teamId` en operaciones de stages.

---

## Bloque 5: Tasks

### Ya Tenemos

- Crear tarea.
- Listar tareas por equipo.
- Listar tareas por stage.
- Listar tareas por prioridad.
- Listar tareas del usuario.
- Ver tarea.
- Actualizar tarea.
- Cambiar status logico.
- Asignar usuarios.
- Soft delete.
- Bloqueo de tarea:
  - `isBlocked`
  - `blockedReason`
- Validacion de parametros en rutas.

### Falta Critico

- Si se cambia `stageId` desde `PUT /tasks/:id`, no queda claro que se sincronicen los arrays `stage.taskIds`.
- Hay dos conceptos separados:
  - `task.status`: estado logico/reportes.
  - `task.stageId`: columna Kanban.
- Falta documentar y hacer consistente ese flujo.
- Falta validar que `chartId` y `stageId` pertenezcan al mismo equipo/chart.
- Falta manejo real de subtareas:
  - `parentTaskId`
  - `subtaskIds`

### Tareas Pequenas

- Persona A:
  - Hacer que cambio de `stageId` use la misma logica que `moveTaskBetweenStages`.
  - Evitar que `PUT /tasks/:id` desincronice stages.
- Persona B:
  - Validar `chartId/stageId/teamId` al crear tarea.
  - Validar `chartId/stageId/teamId` al editar tarea.
  - Evitar asignar tarea a una stage de otro chart/equipo.
- Persona C:
  - Decidir si se implementan subtareas ahora.
  - Si si:
    - Crear endpoints de subtareas.
    - Mantener `parentTaskId`.
    - Mantener `subtaskIds`.
  - Si no:
    - Retirar o dejar documentados esos campos como futuros.

---

## Bloque 6: Calidad, Integracion y Entrega

### Ya Tenemos

- Backend importa correctamente.
- Estructura modular clara.
- CORS controlado por `CORS_ORIGIN`.
- Headers basicos de seguridad con `helmet`.
- `.env.example` con variables requeridas.
- README con instalacion, variables, ejecucion local y seed de roles.
- No se detectaron restos obvios de:
  - `teams.members`
  - `superadmin`
  - coleccion `Charts`

### Falta

- Tests reales.
- Coleccion Postman/Insomnia.
- Documentacion de API para frontend.
- Revision de indices Firestore para queries con `!=`.
- Normalizar timestamps:
  - Actualmente hay mezcla de `new Date()` y `FieldValue.serverTimestamp()`.

### Tareas Pequenas

- Persona A:
  - Documentar API por modulo.
  - Agregar ejemplos de request/response.
  - Marcar permisos requeridos por endpoint.
- Persona B:
  - Crear coleccion Postman/Insomnia.
  - Probar flujo completo de usuario.
  - Probar flujo completo de equipo/proyecto/chart/stage/task.
- Persona C:
  - Revisar timestamps.
  - Unificar criterio.
  - Detectar indices necesarios de Firestore.
  - Mejorar errores consistentes.

---

## Reparto Recomendado

Para no pisarse:

- Persona 1:
  - `auth`
  - `users`
  - `roles`
  - `audit`
- Persona 2:
  - `teams`
  - `projects`
- Persona 3:
  - `charts`
  - `stages`
  - `tasks`

## Prioridad Recomendada

1. Definir e implementar `projectId` en `charts` y `tasks`.
2. Corregir sincronizacion de `task.stageId` con `stage.taskIds`.
3. Completar equipos:
   - Update.
   - Cambio de rol.
   - Archive/delete.
4. Completar charts/stages:
   - Delete chart.
   - Orden de stages.
   - Evitar stages default duplicadas.
5. Mantener actualizada la documentacion de contratos para frontend conforme avancen los siguientes bloques.

## Nota Para el Equipo

El punto mas delicado del sistema ya no son los roles globales, sino mantener consistentes estas relaciones:

- Usuario pertenece a equipo mediante `team_members`.
- Proyecto pertenece a equipo.
- Chart pertenece a equipo y, idealmente, a proyecto.
- Stage pertenece a chart y equipo.
- Task pertenece a equipo, chart, stage y, idealmente, proyecto.

Si cada cambio valida esas relaciones, el backend se mantiene estable y el frontend puede avanzar sin inventar reglas.
