# Deploy — HTTPS bilan

HTTPS **ilova ichida emas**, oldida turgan **Caddy** reverse-proxy orqali beriladi.
Caddy Let's Encrypt sertifikatini avtomatik oladi va yangilaydi.

## 1. Domen tayyorlash

DNS'da 2 ta A-yozuv serveringiz IP'siga yo'naltiring:

- `app.example.com` → frontend
- `api.example.com` → API

`deploy/Caddyfile`da `example.com`ni o'z domeningizga almashtiring.

## 2. Env sozlash (production)

**apps/api/.env:**

```
DATABASE_URL="postgresql://..."           # production baza
JWT_SECRET="<oldingi 96-belgili tasodifiy>"
JWT_EXPIRES_IN="7d"
PORT=4010
NODE_ENV=production
FRONTEND_ORIGIN="https://app.example.com"  # CORS faqat shu domenga ochiladi
```

**apps/web/.env (yoki build vaqtida):**

```
NEXT_PUBLIC_API_URL="https://api.example.com/graphql"
```

> ⚠️ `NEXT_PUBLIC_*` build vaqtida bog'lanadi — o'zgartirsangiz `npm run build`ni qayta bajaring.

## 3. Ilovalarni ishga tushirish (serverda)

```bash
# Postgres
docker compose up -d

# API
cd apps/api && npm run build && node dist/main.js   # yoki pm2/systemd

# Web
cd apps/web && npm run build && npm start            # :3010
```

## 4. HTTPS'ni yoqish (Caddy)

```bash
docker compose -f deploy/docker-compose.https.yml up -d
```

Tamom — `https://app.example.com` ochiladi, sertifikat avtomatik.
Caddy 80/443 portlarни egallaydi va sertifikatni o'zi yangilab turadi.

## Muqobil: platforma orqali (osonroq)

Kod o'zgartirmasdan HTTPS avtomatik keladi:

- **Frontend** → Vercel (Next.js uchun ideal) yoki Netlify
- **API + Postgres** → Railway / Render / Fly.io

Bularда HTTPS platforma tomonidan beriladi — Caddy kerak emas.
Faqat env'larni (yuqoridagi) o'rnatasiz.

## Mahalliy HTTPS (test uchun, ixtiyoriy)

`localhost`da HTTPS shart emas (trafik kompyuterdan chiqmaydi). Lekin
sinash kerak bo'lsa: `mkcert`bilan ishonchli lokal sertifikat yaratib,
Caddy'ni `localhost`ga sozlash mumkin.
