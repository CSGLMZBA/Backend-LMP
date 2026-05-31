# Backend-LMP — TaskFlow

Backend en Node.js + Express para TaskFlow, proyecto final de Lenguajes Modernos de Programacion.

## Stack

- Node.js + Express
- Firebase / Firestore
- JWT (access + refresh token)
- bcrypt, helmet, zod

## Requisitos

- Node.js >= 18
- npm
- Proyecto Firebase con Firestore habilitado

## Instalacion

1. Clonar el repositorio:

```bash
git clone https://github.com/CSGLMZBA/Backend-LMP.git
cd Backend-LMP
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear el archivo de variables de entorno tomando como base `.env.example`:

```bash
cp .env.example .env
```

4. Completar las variables en `.env` con los datos del proyecto Firebase.

5. Inicializar los roles en Firestore:

```bash
npm run seed:roles
```

6. Iniciar el servidor:

```bash
# Desarrollo
npm run dev

# Produccion
npm start
```

Servidor disponible en `http://localhost:3000/api`.

## Variables de Entorno

| Variable | Descripcion |
|---|---|
| `PORT` | Puerto del servidor |
| `CORS_ORIGIN` | Origen permitido por CORS |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Ventana de rate limit en ms (default: 900000) |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Requests maximos en la ventana (default: 20) |
| `JWT_ACCESS_SECRET` | Secreto del access token |
| `JWT_ACCESS_EXPIRES_IN` | Expiracion del access token |
| `JWT_REFRESH_SECRET` | Secreto del refresh token |
| `JWT_REFRESH_EXPIRES_IN` | Expiracion del refresh token |
| `BCRYPT_SALT_ROUNDS` | Rounds de bcrypt |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `FIREBASE_PRIVATE_KEY` | Clave privada de Firebase |
| `FIREBASE_CLIENT_EMAIL` | Email del cliente Firebase |

## Roles

Roles globales de plataforma (en `users.role`):

- `admin` — administra usuarios, roles y auditoria.
- `user` — usuario normal, puede crear equipos.
- `client` — acceso limitado, participa como cliente en equipos.

Roles de equipo (en `team_members.role`):

- `OWNER`, `MANAGER`, `MEMBER`, `CLIENT`

Los permisos dentro de equipos, proyectos y tareas dependen del rol de equipo, no del rol global.

## Endpoints

```
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
PATCH  /api/auth/change-password

GET    /api/users
GET    /api/roles
GET    /api/permissions
GET    /api/audit
GET    /api/dashboard/summary
GET    /api/notifications

/api/teams
/api/projects
/api/charts
/api/stages
/api/tasks
/api/tasks/:id/comments
```
