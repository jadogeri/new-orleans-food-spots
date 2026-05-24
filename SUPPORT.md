# Support

## How to Get Help

### Documentation

Start with the project [README.md](./README.md) — it covers installation, configuration, all API routes, the email system, and the security model.

### Bug Reports & Feature Requests

Use GitHub Issues:

- **Bug report** — describe the problem, steps to reproduce, and the expected outcome.
- **Feature request** — explain the use case and why the feature would be valuable.

> Please search existing issues before opening a new one.

### Security Vulnerabilities

**Do not open a public issue for security problems.** See [SECURITY.md](./SECURITY.md) for the responsible disclosure process.

### Common Questions

#### The server starts but emails are not being sent

Check that `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in your environment. The server logs a warning (`Mail not configured — skipping email`) when credentials are missing and continues running without sending mail.

Ensure `GMAIL_APP_PASSWORD` is a **Gmail App Password** (generated under Google Account → Security → App Passwords), not your regular Gmail login password.

#### The frontend cannot connect to the API

Verify the NestJS API server is running (`GET /api/healthz` should return `{"status":"ok"}`). All traffic is routed through the shared reverse proxy on port 80 — do not call `localhost:8080` directly from frontend code.

#### TypeScript errors after changing the OpenAPI spec

Run the codegen step to regenerate Zod schemas and React Query hooks:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Then run `pnpm run typecheck` to confirm everything compiles.

#### Database schema is out of sync

Push the latest Drizzle schema:

```bash
pnpm --filter @workspace/db run push
```

> This command is safe for development. For production, review the generated SQL before applying.

#### My account is locked

If you have been locked out after 3 failed login attempts, use the Forgot Password flow to receive a temporary password by email. The lockout automatically clears after 30 minutes or when you successfully reset your password.

---

## Contact

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for maintainer contact information.
