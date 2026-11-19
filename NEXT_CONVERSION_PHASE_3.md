# Conversion Progress — Phase 3: usable account pages

The login page and protected dashboard route are included as a migration starting point.

## Current implementation status
- Login API, session cookies, logout, and account lookup are server-side.
- Protected dashboard verifies the PostgreSQL session before rendering.
- User registration, login, and debugger UI still require complete end-to-end tests.
- MFA, email verification, password recovery delivery, OAuth, and admin pages remain unfinished.

Do not publish this branch publicly until the migration checklist is complete and each route passes build and security tests.
