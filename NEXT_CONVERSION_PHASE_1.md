# Phase 1 — Complete data foundation

This phase replaces the Laravel tables and account fields with PostgreSQL/Prisma models. It includes users, sessions, scans, notifications, tickets, teams, billing transactions, monitors, security logs, feedback, integrations, settings, debug jobs, and rate-limit buckets.

## Implemented next
- Fixed password hashing in a server-only module.
- Added signed, opaque session-token support.
- Added registration API foundation.
- Added complete PostgreSQL account/session schema.

## Not finished yet
- Login, logout, password reset, MFA and OAuth callbacks.
- Full UI pages and navigation.
- Scan engine, reports, GitHub integration and payment webhooks.
- Data migration from SQLite/MySQL/old PostgreSQL and cutover.

Each of these is a separate production-sensitive phase. They are implemented and tested before the Laravel route is removed.
