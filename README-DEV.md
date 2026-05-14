# Desarrollo local (FinCredit)

Guía única para levantar **API + frontend con Vite** y contrastar con **Docker Compose**.

## Opción A — Recomendada: API y Vite en la máquina

| Servicio | Comando | URL / puerto |
|----------|---------|----------------|
| PostgreSQL | Docker solo la DB, o instancia local | `postgres://...@localhost:5432/fincredit` |
| API (`server`) | `cd server` → `npm ci` → `npm run dev` | Por defecto **`http://localhost:3001`** (variable `PORT`) |
| Frontend (`client`) | `cd client` → `npm ci` → `npm run dev` | **`http://localhost:5173`** |

El cliente Vite proxea las peticiones **`/api`** al backend definido en [`client/vite.config.js`](client/vite.config.js) (`http://localhost:3001`). Las llamadas del navegador usan rutas relativas tipo `/api/auth/login` sin CORS extra.

1. Copia [`.env.example`](.env.example) a `server/.env` (o exporta variables) con `DATABASE_URL` de PostgreSQL y `JWT_SECRET`.
2. Aplica esquema y datos de prueba: `cd server` → `npx prisma migrate deploy` (o `npx prisma db push` si aún no hay migraciones) → `npm run prisma:seed`.
3. Arranca API y luego el cliente; abre **http://localhost:5173**.

Si la API corre en otro host/puerto, cambia el `server.proxy['/api']` en `client/vite.config.js` o usa un túnel compartido (véase [CONTRIBUTING.md](CONTRIBUTING.md)).

## Opción B — Docker Compose (todo el stack)

[`docker-compose.yml`](docker-compose.yml) levanta Postgres, **API en el contenedor en el puerto interno 3001** y publica **`localhost:3000`** → contenedor `3001`, cliente estático Nginx en **`localhost:3001`** (mapa `3001:80`).

| Servicio | Desde el host |
|----------|----------------|
| API | `http://localhost:3000` |
| Frontend (build producción) | `http://localhost:3001` |
| Postgres | `localhost:5432` |

**No** es el mismo mapeo que la opción A: con Docker la API está en **3000** en el host, mientras que con `npm run dev` del servidor suele ser **3001**. Si usas **Vite a la vez** que Compose, ajusta el proxy de Vite a `http://localhost:3000` o levanta solo la base de datos desde Compose.

## Pruebas E2E (Cypress)

`baseUrl` apunta al frontend de Vite (**5173**). La API para `cy.request` se configura en [`cypress.config.js`](cypress.config.js) (`apiUrl`). Ver [CONTRIBUTING.md](CONTRIBUTING.md) para credenciales alineadas con el seed.

## Documentación de despliegue

- Docker local: [README-DEPLOY.md](README-DEPLOY.md)
- Producción / GHCR: [README-PROD.md](README-PROD.md)

## Colaboración

- Convenciones de equipo, usuarios seed y Cypress: [CONTRIBUTING.md](CONTRIBUTING.md).
