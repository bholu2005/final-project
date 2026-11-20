# Conversion Progress — Phase 8: restore login flow

A fresh inspection showed that the login page on the migration branch still used the invalid `event.preventEvent()` call and did not submit credentials, despite an earlier progress note. The page now uses `preventDefault()`, submits to the existing login API, reports failures, and redirects to the protected dashboard after a successful sign-in.

Verification limitation: this repository tool cannot run the Next.js build or browser tests. Run `npm run typecheck` and `npm run build` in `next-app`, then verify login and registration against a disposable configured database before deployment. The initial migration was also only statically reviewed; do not apply it to a database that has already recorded a prior version without a recovery plan.
