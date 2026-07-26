# VPS deploy — rs.elite-fitness.cloud (fitnesga tegmasdan)

Server: Ubuntu 22.04, nginx 1.18 (host, port 80), fitnes 3 konteyner (4000/4001/4002).
Yog'och portlari 3010/4010/5432 bo'sh. Yog'och to'liq Docker'da, faqat `127.0.0.1`ga
ochiladi, nginx orqali `rs.elite-fitness.cloud`da beriladi. **Fitnes tegilmaydi.**

## 0. DNS (bir marta)
`rs.elite-fitness.cloud` → A-yozuv → serveringiz IP. (Allaqachon qilingan bo'lsa — o'tkazing.)

## 1. Kodni serverga olish
```bash
cd /home
git clone https://github.com/MusannaDev/woodflow.git wood
cd wood
git checkout development
```
(Xususiy repo bo'lsa GitHub token/parol so'raydi.)

## 2. Env yaratish (maxfiy — git'ga tushmaydi)
```bash
cd /home/wood/deploy
cp .env.prod.example .env
# Kuchli qiymatlar yarating va .env ichiga yozing:
echo "DB_PASSWORD=$(openssl rand -hex 24)"
echo "JWT_SECRET=$(openssl rand -hex 48)"
nano .env      # ikkalasini qo'ying
```

## 3. Stack'ni ko'tarish (DB + API + Web, hammasi Docker)
```bash
cd /home/wood/deploy
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker compose -f docker-compose.prod.yml ps        # 3 tasi Up bo'lsin
docker logs woodflow-api --tail 20                  # migrate deploy ✓ ko'ring
```
Tekshiruv (mahalliy):
```bash
curl -s http://127.0.0.1:3010 | head -c 60          # web javob beradi
curl -s http://127.0.0.1:4010/graphql -X POST -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}'                    # {"data":{"__typename":"Query"}}
```

## 4. nginx server-block (fitnes configlariga tegmaydi)
```bash
cp /home/wood/deploy/nginx-rs.conf /etc/nginx/sites-available/rs.elite-fitness.cloud
ln -s /etc/nginx/sites-available/rs.elite-fitness.cloud /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```
`nginx -t` "syntax is ok / test is successful" desa — fitnes ham buzilmagan.

## 5. HTTPS (Let's Encrypt, faqat rs blokini o'zgartiradi)
```bash
apt-get update && apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d rs.elite-fitness.cloud --redirect -m SENING_EMAIL --agree-tos -n
systemctl reload nginx
```
Tamom → https://rs.elite-fitness.cloud

## Yangilanish (keyingi deploylar)
```bash
cd /home/wood && git pull
cd deploy && docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Orqaga qaytarish (agar biror narsa noto'g'ri ketsa)
```bash
# Yog'ochni butunlay o'chirish (fitnesga ta'sir yo'q):
cd /home/wood/deploy && docker compose -f docker-compose.prod.yml down
rm /etc/nginx/sites-enabled/rs.elite-fitness.cloud && systemctl reload nginx
```
Snapshot ham bor — eng yomon holatda tiklanadi.
