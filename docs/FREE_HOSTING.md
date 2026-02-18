# Free Hosting (Zero Cost)

This project is designed to run entirely on free tiers:

- App hosting: Vercel (free) → `https://YOUR-PROJECT.vercel.app`
- Database (MySQL-compatible): TiDB Cloud Serverless (free)
- Media (reels + images): Cloudinary (free)

## 1) Create TiDB Cloud Serverless DB

1. Sign up at TiDB Cloud and create a **Serverless** cluster.
2. Create a database (schema) for the app.
3. Copy the connection string and set it as `DATABASE_URL` in Vercel + locally.

Then run migrations locally:
```bash
npx prisma migrate dev --name init
```

## 2) Create Cloudinary (for reels + images)

1. Create a Cloudinary account (free).
2. From the dashboard, copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Add them as environment variables locally and in Vercel.

## 3) Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to Vercel → New Project → Import the repo.
3. Set environment variables:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `SESSION_PASSWORD` (min 32 chars)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy.

After deploy, run database migrations for production:
- If you have local access to the same DB, run:
```bash
npx prisma migrate deploy
```

## 4) Free domain

- Default: use the free Vercel domain (`*.vercel.app`) — simplest.
- Optional: attach any domain you already own.

