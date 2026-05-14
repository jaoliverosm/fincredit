# FinCredit

Sistema de gestión financiera y crediticia.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + Zustand
- **Backend**: Node.js + Express + Prisma ORM
- **Base de datos**: PostgreSQL / SQLite (dev)
- **Monitoreo**: Prometheus + Grafana
- **Testing**: Jest, Cypress, k6, ZAP

## Estructura

```
FinCredit/
├── client/          # Frontend principal (React)
├── server/          # Backend API (Express/Prisma)
├── next-app/        # Frontend experimental (Next.js)
├── cypress/         # Pruebas E2E
├── tests/           # Pruebas de rendimiento y seguridad
├── monitoring/      # Prometheus + Grafana
└── docker-compose.yml
```

## Desarrollo

```bash
# Frontend
cd client && npm install && npm run dev

# Backend
cd server && npm install && npm run dev
```

Ver `README-DEV.md` y `README-DEPLOY.md` para más detalles.
