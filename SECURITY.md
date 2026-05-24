# Security Policy

## Supported Versions

| Version | Supported |
|---------|:---------:|
| 2.x (current) | ✅ |
| 1.x | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a security issue, email the maintainer directly:

> **security contact**: see the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file for the primary maintainer's contact.

Include the following in your report:

1. **Description** — a clear explanation of the vulnerability.
2. **Steps to reproduce** — a minimal, reproducible example.
3. **Impact** — what data or functionality could be compromised.
4. **Suggested fix** *(optional)* — if you have one.

You will receive an acknowledgement within **48 hours** and a full response within **7 days**.

## Security Measures in This Project

### Authentication & Sessions
- Passwords hashed with **Scrypt** (via Better Auth / oslo) — memory-hard, resistant to GPU cracking.
- Sessions use cryptographically random bearer tokens signed with `SESSION_SECRET`.
- Sessions expire automatically; expired sessions are purged nightly by the cron job.

### Account Protection
- **Lockout policy**: 3 consecutive failed login attempts → account locked for 30 minutes.
- A security alert email is sent to the account holder when a lockout occurs.
- Active accounts can be fully deactivated (all sessions revoked) through the API.

### Temporary Passwords
- Generated passwords use a **no-lookalikes charset** (`0/O/1/l/I` excluded) to prevent transcription attacks.
- The temporary password is stored as a **SHA-256 hash with a per-user salt** in the verifications table.
- Temporary passwords expire after **1 hour**.
- The verification record is deleted immediately after a successful reset.

### Input Validation
- Every request body is validated by **Zod schemas** through `ZodValidationPipe` before reaching service code.
- SQL injection is not possible — Drizzle ORM uses parameterised queries exclusively.

### Transport Security
- All traffic in production is served over **HTTPS/TLS**.
- CORS is configured to allow only trusted origins.

### Email Credentials
- Gmail credentials (`GMAIL_APP_PASSWORD`) are **App Passwords** — not the user's account password — and can be revoked independently.
- No credentials are committed to source control; all secrets are managed through environment variables.

### Logging
- `pino-http` logs request metadata only (method, URL, status, response time).
- Passwords, tokens, and personal data are **never logged**.

## Dependency Auditing

Run the built-in audit at any time:

```bash
pnpm audit
```

Dependencies are pinned via the pnpm workspace catalog (`pnpm-workspace.yaml`) to prevent unintended major upgrades.
