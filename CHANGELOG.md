# Changelog

All notable changes to NOLA Spots are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-05-23

### Added
- **NestJS 10 migration**: replaced the Express 5 server with a full NestJS application using the controller/service/repository pattern.
- **BaseRepository**: Drizzle ORM adapter modelled after MikroORM's `EntityRepository` pattern — `find`, `findOne`, `save`, `update`, `remove` inherited by all subclasses.
- **Mail system** (`@nestjs-modules/mailer` + Handlebars): NOLA dark-gold themed transactional emails for welcome, password recovery, password reset confirmation, account lockout, and account deactivation.
- **No-lookalikes password generator**: temporary passwords exclude ambiguous characters (`0/O/1/l/I`), guaranteed entropy, Fisher-Yates shuffled.
- **Account lockout**: 3 consecutive failed logins → 30-minute lockout + security alert email.
- **Forgot password flow** (`POST /api/auth/forgot-password`): generates and emails a temporary password; uses Better Auth's `requestPasswordReset` + `resetPassword` internally.
- **Reset password flow** (`POST /api/auth/reset-password`): two-step verification — temp password hash check followed by Better Auth's official reset mechanism.
- **Account deactivation** (`POST /api/auth/deactivate`, auth-guarded): sets `is_active = false`, revokes all sessions, sends confirmation email.
- **Session cleanup cron**: `@nestjs/schedule` cron at 01:00 AM America/Chicago — deletes all expired sessions nightly.
- **Welcome email** on new account registration.
- **DB schema additions**: `login_attempts`, `locked_until`, `is_active` columns on `users` table.
- **`@CurrentUser()` decorator** and `AuthGuard` for cleaner controller code.
- **`ZodValidationPipe`**: validates all request bodies against Zod schemas before reaching service code.
- **pino-http request logging** for structured JSON logs.

### Changed
- Auth endpoints now live in `AuthModule` (controller/service) instead of Express route handlers.
- Build script (`build.mjs`) updated: SWC plugin for `emitDecoratorMetadata`, template copy step, extended externals list.
- `auth.ts` now exports `capturedResetTokens` Map to bridge Better Auth's `sendResetPassword` callback with the NestJS service.

### Fixed
- Health endpoint returning 500 due to Zod ESM/CJS mismatch in bundled code.
- `ts-node` incompatibility with ESM workspace libraries.
- NestJS decorator metadata not emitting with esbuild's built-in TS loader.
- `@nestjs/microservices` and `@nestjs/websockets` phantom import errors on startup.
- Handlebars templates not found at runtime (templates now copied to `dist/` by `build.mjs`).

---

## [1.1.0] — 2026-05-01

### Added
- Yelp Fusion search integration with category filters.
- Save, like, and visit tracking per user.
- Personal history view with stats (total saved / liked / visited).

---

## [1.0.0] — 2026-04-15

### Added
- Initial release: Express 5 server, Better Auth email/password authentication, PostgreSQL + Drizzle ORM, React + Vite frontend with Framer Motion NOLA dark theme.
