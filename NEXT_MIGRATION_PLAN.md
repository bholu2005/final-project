# Next.js + PostgreSQL migration notes

The existing app is Laravel 12 + React/Vite. `next-app/` is an additive local prototype and does not replace Laravel or claim feature parity.

## Foundation delivered
- Next.js App Router/TypeScript debug UI and server endpoints.
- PostgreSQL/Prisma persistence for queued debug jobs and results.
- PostgreSQL-backed rate limiting, so no Redis signup/install is needed.
- Worker claims persisted jobs with PostgreSQL `FOR UPDATE SKIP LOCKED`; jobs survive app/worker restarts and stale processing locks can be reclaimed.
- Retry/backoff, bounded provider calls, graceful worker shutdown, health endpoint.
- Optional Docker PostgreSQL for people without a local database; default instructions use an existing local PostgreSQL.

## Still required before public launch
Authentication/ownership, MFA, real GitHub repository/PR integration, verified payment webhooks, full feature migration, archive/URL scan sandboxing, monitoring/backup/restore drills, CI and load/security tests. The prototype is localhost-only; do not make it public until user identity and per-user authorization are implemented.
