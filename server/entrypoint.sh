#!/bin/sh
set -e

echo "=== Running Prisma migrations ==="
npx prisma migrate deploy 2>&1
echo "=== Migrations complete ==="

echo "=== Starting server ==="
exec node src/app.js
