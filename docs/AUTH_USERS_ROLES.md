# Auth, Usuarios y Roles

Contrato base para backend y frontend.

## Roles Globales

Los roles globales viven en `users.role`.

Roles permitidos:

- `admin`
- `user`
- `client`

Uso esperado:

- `admin`: administra usuarios, roles y auditoria.
- `user`: usuario normal de la plataforma, puede crear equipos.
- `client`: usuario con vista mas limitada, pensado para participar como cliente.

Los permisos dentro de equipos no dependen de `users.role`.
Dependen de `team_members.role`.

Roles de equipo:

- `OWNER`
- `MANAGER`
- `MEMBER`
- `CLIENT`

## Registro Publico

Endpoint:

```http
POST /auth/register
```

El registro publico permite:

- Crear usuarios `user`.
- Crear usuarios `client`.
- Omitir `role`.

Si se omite `role`, el backend guarda:

```json
{
  "role": "user"
}
```

Ejemplo de registro default:

```json
{
  "displayName": "Isaac",
  "userName": "isaac",
  "email": "isaac@test.com",
  "password": "123456"
}
```

Ejemplo de registro como client:

```json
{
  "displayName": "Cliente Demo",
  "userName": "cliente_demo",
  "email": "cliente@test.com",
  "password": "123456",
  "role": "client"
}
```

No se permite crear `admin` desde registro publico.

Este request debe fallar por validacion:

```json
{
  "displayName": "Admin Demo",
  "userName": "admin_demo",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

## Creacion Admin de Usuarios

Endpoint:

```http
POST /users
```

Requiere token con nivel admin.

Desde este endpoint, un admin puede crear:

- `admin`
- `user`
- `client`

Ejemplo:

```json
{
  "displayName": "Nuevo Admin",
  "userName": "nuevo_admin",
  "email": "admin2@test.com",
  "password": "123456",
  "role": "admin"
}
```

Decision de proyecto:

- Se permite que un admin cree otro admin por practicidad del proyecto escolar.
- Los usuarios registrados por cuenta propia no pueden elevarse a admin.

## Login Lockout

Endpoint:

```http
POST /auth/login
```

Reglas:

- Password incorrecto incrementa `loginAttempts`.
- Al llegar a 5 intentos fallidos, `isLocked` pasa a `true`.
- Una cuenta bloqueada responde con `ACCOUNT_LOCKED`.
- Login exitoso reinicia:
  - `loginAttempts: 0`
  - `isLocked: false`

## Rate Limit de Auth

Los endpoints publicos de auth tienen rate limit por IP y ruta:

- `POST /api/auth/register`
- `POST /api/auth/login`

Variables:

- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`

Defaults:

- `AUTH_RATE_LIMIT_WINDOW_MS=900000`
- `AUTH_RATE_LIMIT_MAX_REQUESTS=20`

Cuando se excede el limite, el backend responde:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": [
      {
        "retryAfterSeconds": 60
      }
    ]
  }
}
```

## Desbloqueo de Usuarios

Endpoint:

```http
PATCH /users/:userId/unlock
```

Requiere token con nivel admin.

Efecto:

```json
{
  "loginAttempts": 0,
  "isLocked": false
}
```

Errores esperados:

- `USER_NOT_FOUND`
- `USER_NOT_LOCKED`

## Endpoints Principales

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/change-password`

Users:

- `GET /users`
- `GET /users/:userId`
- `POST /users`
- `PUT /users/:userId`
- `PATCH /users/:userId/status`
- `PATCH /users/:userId/unlock`
- `DELETE /users/:userId`

Roles:

- `GET /roles`
- `POST /roles`
- `PUT /roles/:roleId`
- `DELETE /roles/:roleId`

Permissions:

- `GET /api/permissions`

`GET /api/permissions` requiere token con nivel admin y devuelve la lista de permisos disponibles para configurar roles.

## Seed de Roles

Script:

```bash
npm run seed:roles
```

Roles iniciales:

- `admin: 4`
- `user: 2`
- `client: 0`
