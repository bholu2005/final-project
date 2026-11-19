# Conversion Progress — Phase 7: repair initial PostgreSQL migration

Inspection found the initial migration contained literal placeholder SQL (`...OLD_INIT_TABLE...`), so fresh database setup would fail before the application could run. The migration now defines all tables, indexes, enums, and foreign keys represented by `schema.prisma`.

## Important deployment note
This migration has not been executed against a live PostgreSQL database here. Validate it on a disposable database first. If an environment has already recorded this migration as applied or partially applied, do not edit/re-run it blindly; reconcile the database and Prisma migration history using a reviewed recovery plan and backup.

Run `npx prisma validate` and `npx prisma migrate deploy` against a fresh test database, then `npm run typecheck` and `npm run build`. MFA, recovery email delivery, OAuth, and the rest of the Laravel feature set are still outstanding.
