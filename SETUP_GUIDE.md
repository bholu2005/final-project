# Merlin Debugger — Setup Guide

This guide uses simple steps. The new Next.js app uses your PostgreSQL server. The old Laravel app stays unchanged until the new app is tested and complete.

## What you need

- Windows, macOS, or Linux
- Node.js 22 or newer
- PostgreSQL installed and running
- An AI provider API key for live AI answers (optional for installing; required for real AI results)

You do not need Docker, Redis, or a new database app for the normal setup. This local version does not ask users to sign up or log in. Do not put this local prototype on the public internet: login and per-user access are not implemented yet.

## Step 1 — Download the project ZIP

Open the GitHub branch page and download its ZIP:

```text
https://github.com/bholu2005/final-project/archive/refs/heads/copilot/dynamic-ai-debugger.zip
```

Extract the ZIP. Open the extracted `final-project` folder in a terminal. The new app is inside `next-app`.

## Step 2 — Check tools

```bash
node --version
npm --version
psql --version
```

If Node.js is missing, install Node.js 22 from its official download page. PostgreSQL must already be running.

## Step 3 — Make a PostgreSQL database

Use pgAdmin if you already have it, or use `psql` in a terminal. Create a database named `merlin` and a database user with permission to use it. Keep the password private.

Example SQL (run as a PostgreSQL administrator):

```sql
CREATE USER merlin_user WITH PASSWORD 'replace-with-your-own-password';
CREATE DATABASE merlin OWNER merlin_user;
```

Do not use the example password on a real machine.

## Step 4 — Add the app settings

Open a terminal in `next-app` and copy the example file.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Edit `next-app/.env`. Use your PostgreSQL database name, user and password:

```dotenv
DATABASE_URL=postgresql://merlin_user:YOUR_PASSWORD@localhost:5432/merlin?schema=public
APP_ORIGIN=http://localhost:3000
AI_PROVIDER=anthropic
AI_API_KEY=YOUR_AI_PROVIDER_KEY
AI_MODEL=claude-3-5-sonnet-latest
AI_MAX_OUTPUT_TOKENS=1200
```

URL-encode special characters in the database password. Keep `.env` private; never commit it or put API keys in frontend code.

To install without an AI key, leave `AI_API_KEY` blank. The app can start, but it will report that the AI provider is not configured instead of making up an answer.

## Step 5 — Install and prepare the app

```bash
cd next-app
npm install
npx prisma migrate dev --name initial
```

This creates the tables in your PostgreSQL database.

## Step 6 — Start the app and background worker

Open two terminals in the `next-app` folder.

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run worker
```

Open this address in your browser:

```text
http://localhost:3000
```

The app saves each request in PostgreSQL. The worker processes saved jobs and can retry provider failures. If you stop the app or worker, start both again with the same database; queued jobs are still stored. Back up PostgreSQL regularly.

## Stop and restart

Press `Ctrl+C` in each terminal to stop. Start the two commands again to continue. Do not delete the database if you want to keep jobs and results.

## Check that the service is running

Open:

```text
http://localhost:3000/api/health
```

A healthy app reports `status: ok` and `database: ok`.

## Common problems

**Database connection error:** Check PostgreSQL is running, database/user/password are correct, and `DATABASE_URL` uses `localhost` for this local setup.

**Prisma migration error:** Check that the database user can create tables in `merlin`, then run:

```bash
npx prisma migrate dev --name initial
```

**AI says provider not configured:** Add a valid provider key to `.env`, restart the worker, and try again. Provider API usage may cost money.

**Job stays queued:** Make sure Terminal 2 is running `npm run worker` and PostgreSQL is reachable.

**Port 3000 is already used:** Stop the other app using that port, or configure a different Next.js port and update `APP_ORIGIN`.

## Current limits

This is an early Next.js migration starter, not a finished replacement for the complete Laravel website. Login, GitHub repository access, paid plans, file uploads, and production multi-user authorization are not part of this starter yet. Do not deploy it publicly until those security features, tests, backups, and monitoring are completed. The existing Laravel app and data have not been migrated or removed.
