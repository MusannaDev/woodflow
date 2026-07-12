# WoodFlow

Yog'och & Taxta biznes platformasi — monorepo.

```
woodflow/
├── apps/
│   ├── api/     # Backend — NestJS + GraphQL + Prisma (MVP 1-bosqich tayyor)
│   └── web/     # Frontend — Next.js PWA (reja)
├── docker-compose.yml   # umumiy PostgreSQL (dev)
└── .github/workflows/   # CI (ci.yml) + CD (deploy.yml)
```

## Ishga tushirish (dev)

```bash
docker compose up -d          # PostgreSQL (repo ildizidan)

cd apps/api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run start:dev             # → http://localhost:4010/graphql
```

## Loyihalar

| Papka | Nima | Holat |
|---|---|---|
| [apps/api](apps/api) | GraphQL API, tenant izolyatsiya, domain mantiq | MVP 1-bosqich ✓ |
| apps/web | PWA — dashboard, savdo, ombor, hisobot | reja |

Batafsil: [apps/api/README.md](apps/api/README.md).

## Branch modeli

- `development` — kundalik ish (default)
- `master` — production (PR orqali merge, CD shu yerdan)
