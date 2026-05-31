# Backend-LMP

Backend en Node.js para el proyecto final de Lenguajes Modernos de Programacion.

## Requisitos

- Node.js
- npm
- Proyecto Firebase/Firestore

## Instalacion

```bash
npm install
```

## Variables de Entorno

Crear un archivo `.env` tomando como base `.env.example`.

Variables principales:

- `PORT`
- `CORS_ORIGIN`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

## Ejecucion Local

```bash
npm run dev
```

Servidor por default:

```text
http://localhost:3000/api
```

## Seed de Roles

```bash
npm run seed:roles
```

Roles iniciales:

- `admin`
- `user`
- `client`

## Endpoints Base

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `PATCH /api/auth/change-password`
- `GET /api/users`
- `GET /api/roles`
- `GET /api/permissions`
- `GET /api/audit`

## [Documentation](docs/INDEX.md)