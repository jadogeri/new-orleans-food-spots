# NOLA Spots — Project Documentation

**Discover, save, and remember the finest food spots in New Orleans**
Version: 2.0.0 | Author: Joseph Adogeri | Platform: TurboRepo (pnpm monorepo)

---

## Table of Contents

| # | Document | Format | Tool |
|---|----------|--------|------|
| 1 | [Sequence Diagram](diagrams/sequence-diagram.md) | Mermaid | Mermaid |
| 2 | [Use Case Diagram](diagrams/use-case/use-case-diagram.drawio) | draw.io XML | draw.io |
| 3 | [Use Case Description](diagrams/use-case/use-case-description.md) | Markdown | — |
| 4 | [Process Flow Diagram](diagrams/process-flow-diagram.md) | Mermaid | Mermaid |
| 5 | [ERD — Conceptual View](diagrams/erd/erd-conceptual.drawio) | draw.io XML | draw.io |
| 6 | [ERD — Logical View](diagrams/erd/erd-logical.drawio) | draw.io XML | draw.io |
| 7 | [ERD — Physical View](diagrams/erd/erd-physical.drawio) | draw.io XML | draw.io |
| 8 | [Class Diagram](diagrams/class-diagram.md) | Mermaid | Mermaid |
| 9 | [Architecture Layer Diagram](diagrams/architecture-diagram.md) | Mermaid | Mermaid |
| 10 | [Deployment Diagram](diagrams/deployment-diagram.md) | Mermaid | Mermaid |

---

## System Overview

NOLA Spots is a full-stack web application for discovering, saving, and managing favourite food spots in New Orleans. It integrates with the Yelp Fusion API to surface restaurant data, uses Better Auth for secure user authentication, and delivers automated transactional email notifications via Gmail (development) and Brevo (production).

### Monorepo Structure

```
nofs/
├── apps/
│   ├── client/          # React + Vite frontend (port 4000)
│   └── server/          # NestJS REST API (port 3000)
├── packages/
│   ├── api-spec/        # OpenAPI 3.x source of truth (openapi.yaml)
│   ├── api-zod/         # Generated Zod schemas from OpenAPI
│   ├── api-client-react/# Generated React Query hooks
│   └── db/              # Drizzle ORM + Turso/LibSQL client
└── documentation/       # This folder
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4, TanStack Query |
| Backend | NestJS, Zod (validation), Pino (logging) |
| Database | Turso (LibSQL / SQLite cloud), Drizzle ORM |
| Authentication | Better Auth (session-based, email + password) |
| External API | Yelp Fusion API (restaurant search & details) |
| Email | Gmail (dev), Brevo API (production) |
| Shared | OpenAPI 3.x → Zod codegen → React Query codegen |
| Testing | Jest, Vitest, Supertest |
| Deployment | Render (API), Vercel/Static (Client) |

---

## Key Domain Concepts

- **User** — Registered account created via email + password. Persisted with hashed credentials. Supports email verification and account lockout after repeated failed logins.
- **Session** — Short-lived authenticated session managed by Better Auth. Stored server-side and referenced by a cookie.
- **SavedSpot** — The only user-created persistent entity. References a Yelp business ID and caches key business fields (name, image, rating, address) so the app remains functional even when Yelp rate-limits are hit.
- **Yelp Business** — Fetched live from the Yelp Fusion API on every search. Never stored permanently; only summary fields are cached inside `SavedSpot`.
- **Email Notification** — Sent on registration (welcome) and on account-related events (password reset, email verification). Rendered via Handlebars templates on the server.
