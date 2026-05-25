# Contributing to NOLA Spots

Thank you for your interest in contributing! The following guidelines help keep the codebase consistent and the review process smooth.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating you agree to uphold its standards.

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment template and fill in your own values:
   ```bash
   cp .env.example .env
   ```
4. Push the database schema:
   ```bash
   pnpm --filter @repo/db run push
   ```
5. Start the dev servers:
   ```bash
   pnpm --filter @repo/api-server run dev
   pnpm --filter @repo/nola-food run dev
   ```

---

## Development Workflow

| Command | Purpose |
|---------|---------|
| `pnpm run typecheck` | Full typecheck across all workspace packages |
| `pnpm --filter @repo/api-spec run codegen` | Regenerate Zod schemas + React Query hooks from OpenAPI spec |
| `pnpm --filter @repo/db run push` | Push Drizzle schema changes to the dev database |
| `pnpm run build` | Build all packages |

Always run `pnpm run typecheck` before opening a pull request.

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, protected |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Tooling, deps, docs |

Branch off `main`, keep branches short-lived.

---

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`

**Examples**:
```
feat(auth): add account lockout after 3 failed login attempts
fix(mail): handle missing GMAIL_USER gracefully at startup
chore(deps): bump @nestjs/schedule to 6.1.3
```

---

## Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Run `pnpm run typecheck` — all checks must pass.
3. Fill in the pull request template completely.
4. Request a review from at least one maintainer.
5. Squash commits before merging if the PR history is noisy.

---

## Code Standards

- **TypeScript strict mode** — no `any` unless absolutely necessary (prefer `unknown`).
- **Zod schemas** for all request body validation — never trust raw `req.body`.
- **NestJS module pattern** — each feature in its own `module / controller / service / repository` set.
- **No `console.log`** in server code — use the NestJS `Logger` or `req.log` (pino).
- **Drizzle ORM** for all database access — no raw SQL strings except inside `sql` tagged template literals.
- **No secrets in code** — use environment variables only.

---

## Reporting Bugs

Please open a GitHub Issue using the bug report template. Include:

- Node.js and pnpm versions
- Steps to reproduce
- Expected vs actual behaviour
- Relevant log output (sanitised — no passwords or tokens)

For security vulnerabilities, see [SECURITY.md](./SECURITY.md).
