# Ethnic World (Exclusive) — Marketplace (COD)

Next.js storefront + admin, with a free MySQL-compatible database (TiDB Cloud Serverless) and free media hosting for reels (Cloudinary free tier).

Store details:
- Name: Ethnic World (Exclusive)
- Address: Main Road, Rajupura Mangotrian, Jammu
- Contact: 9149776197

## Local setup

0) Use Node.js LTS (recommended)
- This repo is tested on Node 20.x. If you’re on a very new Node version, Next.js dev/build can behave oddly.
- If you use `nvm`: `nvm install && nvm use` (reads `.nvmrc`).

1) Install deps:
```bash
npm install
```

2) Create `.env.local`:
```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB?sslaccept=strict"
ADMIN_EMAIL="owner@example.com"
ADMIN_PASSWORD="change-me"
SESSION_PASSWORD="at-least-32-characters-long-random-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3) Create a free database:
- Recommended: TiDB Cloud Serverless (MySQL protocol, free tier, scalable)
- Alternative: any hosted MySQL you have access to (the app uses Prisma)

4) Create tables (only needed once per database, or after Prisma schema changes):
```bash
npm run db:migrate
```
Why not `prisma migrate dev`?
- `migrate dev` creates *new* migrations (developer workflow) and uses a “shadow database”, which can fail on some hosted MySQL/TiDB setups.
- For a hosted DB, `migrate deploy` is usually the smoothest.

5) Seed sample product (optional):
```bash
npm run db:seed
```

6) Run:
```bash
npm run dev
```
For faster dev navigation/compiles:
```bash
npm run dev:turbo
```

## Admin
- Visit `/admin/login` and sign in using `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

## Notes
- Reels and product images upload to Cloudinary via signed uploads from `/api/admin/cloudinary-sign`.
- Payments are intentionally not integrated; checkout places COD orders only.
 - If a production build ever gets into a weird state, use `npm run build:clean` (cleans `.next` automatically).

Deployment: `docs/FREE_HOSTING.md`
