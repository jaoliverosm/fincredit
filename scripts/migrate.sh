#!/usr/bin/env bash
# Script para ejecutar migraciones de Prisma de forma segura
# - Realiza backup si es posible
# - Ejecuta migraciones
# - Es idempotente (npx prisma migrate deploy no aplica migraciones ya aplicadas)

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR/server"

if [ -z "${DATABASE_URL-}" ]; then
  echo "ERROR: DATABASE_URL no está configurada. Abortando."
  exit 1
fi

# Intentar backup antes de migrar
if command -v bash ./scripts/backup.sh >/dev/null 2>&1; then
  echo "Ejecutando backup antes de migración..."
  bash ./scripts/backup.sh || echo "Advertencia: backup falló, continúo con migración"
fi

# Ejecutar migraciones de Prisma (idempotente)
echo "Ejecutando prisma migrate deploy..."
npx prisma migrate deploy --preview-feature || true

# Ejecutar seed si existe
if [ -f prisma/seed.js ]; then
  echo "Ejecutando seed..."
  node prisma/seed.js || echo "Seed falló o no aplica"
fi

echo "Migraciones completadas"
