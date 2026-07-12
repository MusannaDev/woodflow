# ---- Build bosqichi ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ---- Runtime bosqichi ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Generatsiya qilingan Prisma client'ni build bosqichidan olamiz
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4010
# Ishga tushishdan oldin migratsiyalarni qo'llaydi, keyin serverni boshlaydi
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
