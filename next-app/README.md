# Merlin Next.js/PostgreSQL migration starter

This is an additive prototype; the existing Laravel application is not replaced. It requires your existing PostgreSQL server and Node.js. It does not require Redis, Docker, or a provider signup for the app itself. Live AI responses do require an API key from an AI provider. Without one, jobs report provider-not-configured rather than returning fake answers.

## Run with your existing PostgreSQL (no Docker/Redis)

1. Create a PostgreSQL database and user locally (one-time, using your installed PostgreSQL tools). Set `DATABASE_URL` in `next-app/.env` to that database. Example:

```dotenv
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/merlin?schema=public
APP_ORIGIN=http://localhost:3000
AI_PROVIDER=anthropic
AI_API_KEY=your_provider_key
AI_MODEL=claude-3-5-sonnet-latest
AI_MAX_OUTPUT_TOKENS=1200
```

2. Install Node.js 22 if it is not already installed, then run:

```bash
cd next-app
npm install
npx prisma migrate dev --name initial
npm run dev
```

3. In a second terminal, start the durable PostgreSQL queue worker:

```bash
cd next-app
npm run worker
```

Open http://localhost:3000. No user login/signup is required by this local prototype. Keep it bound to localhost; it is not yet safe for public internet exposure or multiple users.

## Optional Docker PostgreSQL

Only use this if you do not want to use your installed PostgreSQL. Copy `.env.docker.example` to repository-root `.env.next`, use a long random `POSTGRES_PASSWORD`, and set DATABASE_URL to the same password. Then run:

```bash
docker compose --env-file .env.next -f next-app/docker-compose.yml up --build -d
```

Apply schema migration:

```bash
docker compose --env-file .env.next -f next-app/docker-compose.yml run --rm web npx prisma migrate deploy
```

Web is bound to localhost port 3000. PostgreSQL is private in the compose network, and its volume persists across restarts. `docker compose down -v` deletes database data.

## Important gaps

The existing Laravel app remains unchanged. This prototype does not yet include account login, GitHub repository access, billing, MFA, full feature parity, or production multi-user authorization. Do not expose it publicly until those are added. Back up PostgreSQL and plan a reversible data migration before any cutover. Add a verified AI provider key only to a private local `.env`, never commit it.
