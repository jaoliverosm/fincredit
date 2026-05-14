#!/usr/bin/env bash
# Script de backup para PostgreSQL
# Requiere: pg_dump y variables de entorno PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-fincredit}

FILENAME="$BACKUP_DIR/backup_${PGDATABASE}_${TIMESTAMP}.sql"

echo "Iniciando backup: $FILENAME"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump no encontrado. Instala PostgreSQL client."
  exit 1
fi

PGPASSWORD=${PGPASSWORD:-}
export PGPASSWORD

pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -F p -d "$PGDATABASE" -f "$FILENAME"

# Si DB_BACKUP_KEY está presente, encriptar con openssl
if [ -n "${DB_BACKUP_KEY-}" ]; then
  echo "Encriptando backup con DB_BACKUP_KEY..."
  openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:"$DB_BACKUP_KEY" -in "$FILENAME" -out "${FILENAME}.enc"
  shred -u "$FILENAME" || rm -f "$FILENAME"
  echo "Backup encriptado: ${FILENAME}.enc"
else
  echo "Backup sin encriptar: $FILENAME"
fi

echo "Backup completado"
