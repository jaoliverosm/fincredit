# Contribución y trabajo en equipo (FinCredit)

## Flujo con Git

- Crea una rama por tarea a partir de `main` (`feature/…`, `fix/…`).
- Abre un **pull request** hacia `main`; al menos una revisión antes de fusionar cuando el equipo lo exija.
- Mantén los commits con mensajes claros; el CI en `.github/workflows/ci.yml` ejecuta tests del servidor en cada PR.

## Entorno local compartido

- Sigue **[README-DEV.md](README-DEV.md)** para puertos (**Vite 5173**, API **3001**) y proxy `/api`.
- Con **Docker Compose**, la API en el host suele ser **http://localhost:3000** y el frontend estático **http://localhost:3001**; no mezcles URLs sin revisar el README.

## Staging

- Opción recomendada: un despliegue compartido (p. ej. `docker-compose.prod.yml`, Render u otra plataforma) con URL fija y variables en el gestor de secretos del proveedor.
- Documenta la URL de staging en el canal del equipo; no commitees `.env` con credenciales.

## Usuarios de prueba (seed)

Tras `npm run prisma:seed` en `server` (con base de datos ya migrada), puedes usar:

| Rol        | Email                 | Contraseña   |
|------------|------------------------|--------------|
| Supervisor | `admin@fincredit.com`  | `admin123`   |
| Empleado   | `juan@fincredit.com`   | `empleado1`  |
| Empleado   | `maria@fincredit.com`  | `empleado2`  |
| Cliente    | `carlos@gmail.com`     | `cliente1`   |
| Cliente    | `ana@gmail.com`        | `cliente2`   |

Cypress y los fixtures en `cypress/` usan el mismo supervisor/empleado/cliente que la tabla anterior.

## Pruebas E2E

- API en **3001** y `npm run dev` del cliente en **5173** (ver README-DEV).
- Desde la raíz del repo: `npx cypress open` (interactivo) o `npx cypress run` (headless), con la configuración de [`cypress.config.js`](cypress.config.js).

## Despliegue

- Resumen de producción: [README-PROD.md](README-PROD.md) y [README-DEPLOY.md](README-DEPLOY.md).
