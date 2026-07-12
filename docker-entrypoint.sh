#!/bin/sh
set -e

# Migratsiyalarni qo'llash (production'da migrate deploy — dev emas)
echo "→ Prisma migrate deploy..."
npx prisma migrate deploy

echo "→ Server ishga tushmoqda..."
exec "$@"
