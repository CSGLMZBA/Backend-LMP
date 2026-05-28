# Checklist del Sistema Backend

Documento para repartir trabajo entre el equipo sin pisarse.

Actualizado tomando en cuenta la guia del proyecto final:

- APIs comunes obligatorias.
- Seguridad minima.
- Proyecto 5: TaskFlow.
- Entregables minimos.
- Criterios de aceptacion.

Nota: el profesor autorizo Express, asi que el uso de Express queda aceptado para este proyecto.

## Estado Actual

- Rama revisada: `develop`.
- Verificacion general usada durante la revision: `app import ok`.
- Backend principal: Node.js + Express + Firebase/Firestore.
- Frontend esperado por guia: framework moderno con rutas protegidas.

## Panorama General

Ya existen estos modulos principales:

- `auth`
- `users`
- `roles`
- `permissions`
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
- `charts` dependen de `teamId` y `projectId`.
- `stages` dependen de `chartId` y `teamId`.
- `tasks` usan `teamId`, `projectId`, `chartId` y `stageId`.
- Login lockout y desbloqueo de usuarios ya existen.
- Seed de roles globales ya existe.

---

## Criterios de la Guia

### APIs Comunes Obligatorias

Ya cubiertas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `PATCH /api/auth/change-password`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`
- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/permissions`
- `GET /api/dashboard/summary`
- `GET /api/audit`
- `GET /api/health`

Falta:

- No hay pendientes criticos de APIs comunes obligatorias.

### APIs Minimas de TaskFlow

Ya cubiertas o parcialmente cubiertas:

- `/api/projects` CRUD + status.
- `/api/tasks` CRUD.
- `/api/tasks/:id/status`.
- `/api/tasks/:id/assign`.
- Dashboard de avance por proyecto mediante `GET /api/dashboard/summary`.

Falta:

- `/api/tasks/:id/comments`
- `/api/notifications`
- `/api/notifications/read-all`

### Seguridad Minima

Ya cubierto:

- JWT access token con expiracion.
- Refresh token.
- Logout invalida sesion mediante `tokenVersion`.
- Hash de passwords con bcrypt.
- Middleware de autorizacion.
- Roles globales.
- Roles por equipo.
- Validacion con schemas.
- CORS controlado por `CORS_ORIGIN`.
- Headers basicos con `helmet`.
- Rate limit basico en login/registro.
- Respuesta JSON estandar.
- Auditoria base de auth/users.

Falta o revisar:

- Auditoria del resto de modulos importantes:
  - teams
  - projects
  - charts
  - stages
  - tasks
  - comments
  - notifications
- Sanitizacion explicita de inputs donde aplique.
- Revision de errores para evitar mensajes genericos o inconsistentes.
- Indices Firestore necesarios para queries con `!=`.

### Entregables Minimos

Ya cubierto o iniciado:

- README con instalacion, variables, ejecucion local y seed.
- `.env.example`.
- Documento de auth/users/roles en `docs/AUTH_USERS_ROLES.md`.
- Checklist general en este archivo.

Falta:

- Documento breve de arquitectura:
  - modulos
  - roles
  - entidades
  - endpoints
- Coleccion Postman/Insomnia.
- Evidencia de pruebas manuales.
- Capturas o video corto de funcionamiento.
- Usuario de prueba documentado.
- Instrucciones claras de configuracion de base de datos/Firebase.
- Documentacion de API para frontend por modulo.

---

## Bloque 1: Auth, Usuarios, Roles, Permissions y Audit Base

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
- Auditoria de auth/users para:
  - login
  - login_failed
  - logout
  - create
  - update
  - delete
  - status_change
  - sensitive_change
- Contrato de auth/usuarios/roles documentado en `docs/AUTH_USERS_ROLES.md`.
- Endpoint `GET /api/permissions`.
- Roles globales con seed:
  - `admin: 4`
  - `user: 2`
  - `client: 0`

### Falta

- No hay pendientes criticos para cerrar el Bloque 1 contra la guia.
- Pendiente transversal:
  - Probar manualmente todos los endpoints.
  - Agregar los requests a Postman/Insomnia.

### Tareas Pequenas

- Persona A:
  - Crear pruebas manuales de auth.
  - Documentar usuario admin de prueba.
- Persona B:
  - Crear requests Postman/Insomnia de auth/users/roles/permissions/audit.
- Persona C:
  - Revisar mensajes de error finales y consistencia de codigos.

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
- Actualizar equipo.
- Archivar/eliminar equipo mediante soft archive.
- Cambiar rol de miembro.
- Evitar remover o degradar al ultimo `OWNER`.
- Parametros validados en rutas de equipos.
- Solo usuarios globales `user`/`admin` pueden crear equipos.
- Auditoria de acciones importantes de equipos:
  - create team
  - update team
  - archive team
  - join team
  - add member
  - remove member
  - change member role
- Permisos por `team_members`.
- Ya no dependemos de `teams.members`.

### Falta

- No hay pendientes funcionales criticos del Bloque 2.
- Pendiente transversal:
  - Probar manualmente endpoints.
  - Agregar requests a Postman/Insomnia.

### Tareas Pequenas

- Persona A:
  - Probar manualmente `PATCH /teams/:teamId`.
  - Probar manualmente `DELETE /teams/:teamId`.
  - Documentar request/response de update y archive.
- Persona B:
  - Probar manualmente `PATCH /teams/:teamId/members/:userId/role`.
  - Probar que no se pueda degradar al ultimo `OWNER`.
  - Probar que no se pueda remover al ultimo `OWNER`.
- Persona C:
  - Probar que `client` no pueda crear equipos.
  - Revisar eventos de auditoria generados por equipos.

---

## Bloque 3: Proyectos

### Decision Tomada

- `charts` deben colgar de `projectId`.
- `tasks` deben colgar de `projectId`.

### Ya Tenemos

- Crear proyecto por equipo.
- Listar proyectos accesibles por equipos del usuario.
- Ver proyecto con charts y resumen de tareas.
- Actualizar proyecto.
- Cambiar status.
- Soft delete.
- `projectId` obligatorio al crear charts.
- `projectId` obligatorio al crear tasks.
- Queries internas:
  - charts por proyecto.
  - tasks por proyecto.
- Validaciones cruzadas:
  - `project.teamId === chart.teamId`
  - `project.teamId === task.teamId`
  - `chart.teamId === task.teamId`
  - `chart.projectId === task.projectId`
  - `stage.chartId === task.chartId`
- Endpoint global de dashboard/resumen:
  - `GET /api/dashboard/summary`
- Resumen global autenticado:
  - total de equipos accesibles
  - proyectos por status
  - tareas por status
  - tareas por prioridad
  - tareas completadas
  - tareas bloqueadas
  - tareas vencidas
  - tareas asignadas al usuario
  - resumen por proyecto

### Falta Importante

- Auditoria de proyectos.
- Filtros o busqueda basica de proyectos, si aplica en frontend.

### Tareas Pequenas

- Persona A:
  - Crear auditoria de proyectos:
    - create
    - update
    - status_change
    - delete
- Persona B:
  - Definir filtros/busqueda de proyectos que necesitara el frontend.
  - Implementar query params si hacen falta.
- Persona C:
  - Probar manualmente `GET /api/dashboard/summary`.
  - Ajustar metricas si el frontend necesita otro formato.

---

## Bloque 4: Charts, Stages, Kanban y Dashboard

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
- Auditoria de charts/stages.

### Tareas Pequenas

- Persona A:
  - Crear `DELETE /charts/:chartId` como soft delete.
  - Validar permisos por equipo/proyecto.
  - Decidir que pasa con sus stages.
- Persona B:
  - Agregar campo `order` en stages.
  - Crear endpoint para reordenar stages.
  - Validar orden unico dentro del chart.
- Persona C:
  - Probar dashboard con datos reales de proyecto/chart/task.
  - Ajustar campos para las tarjetas o graficas del frontend.
  - Agregar auditoria donde aplique.

---

## Bloque 5: Tasks, Comentarios y Notificaciones

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
- Historial de status en `statusHistory`.

### Falta Critico

- Si se cambia `stageId` desde `PUT /tasks/:id`, debe sincronizarse con `stage.taskIds`.
- Hay dos conceptos separados:
  - `task.status`: estado logico/reportes.
  - `task.stageId`: columna Kanban.
- Falta documentar y hacer consistente ese flujo.
- Falta manejo real de subtareas o decidir posponerlo.
- Faltan comentarios, obligatorios para TaskFlow:
  - `GET /api/tasks/:id/comments`
  - `POST /api/tasks/:id/comments`
  - `PUT/PATCH /api/tasks/:id/comments/:commentId` si aplica
  - `DELETE /api/tasks/:id/comments/:commentId` si aplica
- Faltan notificaciones, obligatorias para TaskFlow:
  - `GET /api/notifications`
  - `PATCH /api/notifications/read-all`
- Falta auditoria de tareas/comentarios/notificaciones.
- Faltan filtros suficientes para aceptacion:
  - responsable
  - prioridad
  - estado
  - proyecto

### Tareas Pequenas

- Persona A:
  - Hacer que cambio de `stageId` use la misma logica que `moveTaskBetweenStages`.
  - Evitar que `PUT /tasks/:id` desincronice stages.
  - Mantener las validaciones cruzadas cuando se corrija la sincronizacion.
- Persona B:
  - Crear modulo `comments`.
  - Crear endpoints de comentarios por tarea.
  - Validar que solo miembros del proyecto/equipo puedan comentar/ver.
  - Auditar comentarios.
- Persona C:
  - Crear modulo `notifications`.
  - Crear notificaciones al asignar tarea o cambiar estado.
  - Crear `GET /api/notifications`.
  - Crear `PATCH /api/notifications/read-all`.
  - Auditar notificaciones si aplica.

---

## Bloque 6: Calidad, Seguridad, Pruebas y Entrega

### Ya Tenemos

- Backend importa correctamente.
- Estructura modular clara.
- CORS controlado por `CORS_ORIGIN`.
- Headers basicos de seguridad con `helmet`.
- Rate limit en auth.
- `.env.example` con variables requeridas.
- README con instalacion, variables, ejecucion local y seed de roles.
- Respuesta JSON estandar.
- No se detectaron restos obvios de:
  - `teams.members`
  - `superadmin`
  - coleccion `Charts`

### Falta

- Tests reales o pruebas manuales documentadas.
- Coleccion Postman/Insomnia.
- Documentacion de API para frontend por modulo.
- Documento breve de arquitectura:
  - modulos
  - roles
  - entidades
  - endpoints
- Usuario de prueba documentado.
- Capturas o video corto de funcionamiento.
- Revision de indices Firestore para queries con `!=`.
- Normalizar timestamps:
  - actualmente hay mezcla de `new Date()` y `FieldValue.serverTimestamp()`.
- Revisar sanitizacion.
- Revisar errores genericos en controladores.

### Tareas Pequenas

- Persona A:
  - Documentar API por modulo.
  - Agregar ejemplos de request/response.
  - Marcar permisos requeridos por endpoint.
- Persona B:
  - Crear coleccion Postman/Insomnia.
  - Probar flujo completo de usuario.
  - Probar flujo completo de equipo/proyecto/chart/stage/task.
  - Documentar resultados de pruebas manuales.
- Persona C:
  - Crear documento de arquitectura.
  - Revisar timestamps.
  - Detectar indices necesarios de Firestore.
  - Mejorar errores consistentes.

---

## Bloque 7: Frontend Minimo Segun Guia

Este bloque vive principalmente en el proyecto frontend, pero debe coordinarse con backend.

### Paginas Minimas

- Login.
- Dashboard.
- Proyectos.
- Detalle de proyecto.
- Tablero Kanban.
- Tareas.
- Notificaciones.
- Perfil.

### Requisitos Frontend

- Manejar token.
- Proteger rutas privadas.
- Consumir API con fetch/axios/servicio HTTP.
- Mostrar mensajes de error.
- Validacion visual en formularios.
- CRUD principal.
- Navegacion consistente.
- Interfaz responsiva.

### Dependencias Backend para Frontend

- `GET /api/dashboard/summary`.
- `GET /api/notifications`.
- `PATCH /api/notifications/read-all`.
- Comentarios de tareas.
- Filtros por responsable, prioridad y estado.

---

## Reparto Recomendado

Para no pisarse:

- Persona 1:
  - `auth`
  - `users`
  - `roles`
  - `permissions`
  - `audit`
  - documentacion base
- Persona 2:
  - `teams`
  - `projects`
  - `dashboard`
- Persona 3:
  - `charts`
  - `stages`
  - `tasks`
  - `comments`
  - `notifications`

## Prioridad Recomendada Actualizada

1. Corregir sincronizacion de `task.stageId` con `stage.taskIds`.
2. Crear comentarios de tareas.
3. Crear notificaciones.
4. Completar charts/stages:
   - delete chart
   - orden de stages
   - evitar stages default duplicadas
5. Preparar entregables:
   - Postman/Insomnia
   - pruebas manuales
   - arquitectura
   - capturas/video

## Nota Para el Equipo

El punto mas delicado del sistema es mantener consistentes estas relaciones:

- Usuario pertenece a equipo mediante `team_members`.
- Proyecto pertenece a equipo.
- Chart pertenece a equipo y proyecto.
- Stage pertenece a chart y equipo.
- Task pertenece a equipo, proyecto, chart y stage.
- Comentario pertenece a task y usuario.
- Notificacion pertenece a usuario y puede referenciar task/proyecto.

Si cada cambio valida esas relaciones, el backend se mantiene estable y el frontend puede avanzar sin inventar reglas.
