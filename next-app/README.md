# Next.js + PostgreSQL migration starter (Laravel remains unchanged)

This directory is an **additive migration foundation**, not a completed replacement for the existing Laravel application. The original Laravel/React app remains the default. Start this isolated Next.js app after configuring the environment below.

## Local run without Docker

Requires Node.js 22, PostgreSQL, Redis, and an AI provider key.

```bash
cd next-app
cp .env.example .env
# Edit DATABASE_URL and REDIS_URL for local services; add AI_API_KEY and APP_SECRET.
npm install
npx prisma migrate dev --name initial
npm run dev
```

In another terminal:

```bash
cd next-app
npm run worker
```

Open http://localhost:3000. The debug endpoint queues requests in Redis and stores status/results in PostgreSQL. Jobs remain in Redis through worker/app restarts when using the provided persistent Docker volumes; workers retry provider failures and drain active jobs on shutdown.

## Docker local stack

From the repository root, copy `next-app/.env.example` to `.env.next`, replace `POSTGRES_PASSWORD` with a unique value and fill in the AI API key. Adjust `DATABASE_URL` to use the password you set (host `postgres` inside Docker). Then run:

```bash
docker compose --env-file .env.next -f next-app/docker-compose.yml up --build -d
```

Apply schema migration as a one-off container command after build:

```bash
docker compose --env-file .env.next -f next-app/docker-compose.yml run --rm web npx prisma migrate deploy
```

Web is bound to localhost port 3000 by default; place a correctly configured TLS reverse proxy in front before exposing it publicly. PostgreSQL and Redis are not host-published. Volumes persist data across container restarts; `docker compose down -v` deletes it.

## Environment

Set `DATABASE_URL`, `REDIS_URL`, `APP_ORIGIN`, `APP_SECRET`, `AI_PROVIDER`, `AI_API_KEY`, and `AI_MODEL`. Never commit `.env.next`, API keys, or production secrets. Use a managed secrets store and managed PostgreSQL/Redis in hosted environments.

## Important gaps before production

This is not yet a complete port of every Laravel page, feature, or database model. The first Next UI is a single-user debugging prototype: it does not yet include login, per-user authorization, GitHub repository access, billing, MFA, file uploads, or account-level quotas. Do not publicly expose the debug API until proper identity/auth, ownership checks, CAPTCHA/abuse controls, data retention, and audit coverage are implemented. The rate limiter relies on trusted reverse-proxy client IP headers; configure that proxy to overwrite them. CI/build/tests are still required.

Do not run both stacks against production data during migration. Back up the existing database and plan a tested, reversible data migration before switching traffic.
