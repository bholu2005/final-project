# Conversion Progress — Phase 4: account form wiring

- Login form submits to the login API and redirects to the protected dashboard after success.
- Registration form submits to the registration API; password strength validation and API rate limiting are retained.
- Registration success returns users to login; email verification and automatic sign-in are not implemented.

This is incremental migration work. Build/tests have not been executed in this environment. Verify route groups, styles, Prisma migrations, and the complete registration/login flow before deployment. MFA, password reset delivery, OAuth, and the rest of the Laravel feature set remain outstanding.
