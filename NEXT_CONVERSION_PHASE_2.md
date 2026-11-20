# Conversion progress — Phase 2: authentication base

## Implemented
- PostgreSQL-backed opaque session cookies (HttpOnly, SameSite=Lax, Secure in production).
- Session token hashes are stored in PostgreSQL; raw tokens are only held in the browser cookie.
- Login and registration endpoints use generic validation, password hashing, and PostgreSQL rate limits.
- Logout revokes the active session; `GET /api/auth/me` checks the database session and expiry.

## Not complete
- MFA enrollment and login challenge are not implemented. Login explicitly refuses MFA-enabled accounts until challenge verification exists.
- Password recovery is not safe to use until an email delivery provider is configured and end-to-end tested; the current recovery route should not be used in production.
- Registration UI, login UI, email verification, OAuth, ownership checks on all features, and full UI/API parity are still outstanding.

This is incremental migration work, not a finished production application. Keep the existing Laravel app available and do not route public traffic to this Next.js prototype.
