# Next.js migration plan and operational notes

## Current application vs migration target

The existing application is Laravel 12 + React 19/Vite. Replacing it in a single change would risk losing working screens and API behavior. The `next-app/` directory therefore starts an additive Next.js App Router + TypeScript service with PostgreSQL (Prisma), Redis/BullMQ durable background jobs, health checks, bounded provider calls, request validation, and local container persistence. Existing Laravel stays in place until the replacement reaches feature parity and has passed migration/acceptance tests.

## Phases

1. **Foundation (this commit):** Next.js app shell; PostgreSQL schema; Redis-backed durable debug jobs; worker retries/concurrency; health endpoint; Docker Compose with persistent volumes, restart policies, and private database ports.
2. **Identity/security:** Real server-side sessions, OAuth callback exchange and state validation, CSRF/origin policy, MFA enrollment/recovery, owner-scoped records and quotas, abuse protection.
3. **Feature parity:** Port pages and APIs incrementally (dashboard, scans, reports, settings, teams, support, notifications, admin), replacing fake controls with backed features.
4. **Scanning and GitHub:** Hardened archive parsing and URL SSRF controls, isolated analysis, GitHub App/repository permissions, reviewable pull-request creation. Never automatically merge fixes.
5. **Billing:** Integrate a payment provider only with signed webhook verification; derive prices and entitlements on the server.
6. **Migration/cutover:** Export/import with reconciliation, staged traffic, rollback procedure, backups, observability, load/security testing. Remove Laravel only after verified parity and explicit cutover approval.

## Runtime resilience

PostgreSQL and Redis use named Docker volumes. Redis AOF is enabled; BullMQ jobs are retried with exponential backoff; the worker handles SIGTERM/SIGINT and drains work; Next and worker containers restart automatically; the health endpoint probes both stores. This is a local/self-hosted baseline, not a high-availability guarantee: production needs backups, restore drills, TLS, managed databases/Redis, capacity planning, trusted proxy settings, metrics/alerts, and queue failure monitoring.
