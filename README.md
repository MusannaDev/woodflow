# WoodFlow — backend

Yog'och & Taxta biznes platformasi. NestJS + GraphQL + Prisma + PostgreSQL.

## MVP 1-bosqich (hozir tayyor)

Auth + Workspace izolyatsiya + Xarajatlar moduli — poydevor.

| Qatlam | Fayl |
|---|---|
| Domain model | [prisma/schema.prisma](prisma/schema.prisma) |
| Tenant izolyatsiya | [src/common/tenant/](src/common/tenant/), [src/common/guards/workspace.guard.ts](src/common/guards/workspace.guard.ts) |
| Prisma (avto-filtr) | [src/prisma/prisma.service.ts](src/prisma/prisma.service.ts) |
| Valyuta / UoM | [src/common/money/](src/common/money/) |
| Auth (JWT) | [src/auth/](src/auth/) |
| Xarajatlar | [src/expenses/](src/expenses/) |

## Ishga tushirish

```bash
cp .env.example .env          # DATABASE_URL, JWT_SECRET ni to'ldiring
docker compose up -d          # PostgreSQL
npm install
npm run prisma:generate
npm run prisma:migrate        # birinchi migratsiya
npm run db:seed               # egа Adam + 2 workspace
npm run start:dev             # → http://localhost:4000/graphql
```

## Sinov (GraphQL Playground)

```graphql
mutation {
  login(input: { phone: "+998901234567", password: "woodflow" }) {
    token
    workspaces { id name type role }
  }
}
```

`token` ni `Authorization: Bearer <token>`, workspace id ni `x-workspace-id`
header'ida yuborib xarajatlarni so'rang:

```graphql
query { expenses { id category amountUzs date description } }

mutation {
  createExpense(input: {
    category: GAS, amountUzs: 1200000, date: "2026-07-11T00:00:00Z"
  }) { id category amountUzs }
}
```

## Izolyatsiya qanday ishlaydi

1. `WorkspaceGuard` — `x-workspace-id` header'ini o'qiydi, a'zolikni tekshiradi,
   `req.workspaceId` ni o'rnatadi.
2. `TenantInterceptor` — uni `AsyncLocalStorage`'ga qo'yadi.
3. `PrismaService.client` — tenant-scoped modellarni (`Purchase`, `Sale`,
   `InventoryLot`...) avtomatik shu workspace bo'yicha filtrlaydi.
   `Expense`/`Employee` nullable-workspace bo'lgani uchun qo'lda filtrlanadi
   (joriy workspace + umumiy).

## Keyingi bosqichlar (System Design §10)

2. Fura + kirim + ombor + nuqson  ·  3. Savdo + to'lov + fura P&L
4. Ishlab chiqarish + ichki transfer  ·  5. Ishchi/oylik + konsolidatsiya
