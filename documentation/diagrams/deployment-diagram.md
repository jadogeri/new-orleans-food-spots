# Deployment Diagram

> **Tool:** Mermaid — paste into [mermaid.live](https://mermaid.live) or any Mermaid-compatible renderer.

## Production Deployment View

```mermaid
graph TB
    subgraph USER_DEVICES["User Devices"]
        BROWSER["Web Browser\nChrome / Firefox / Safari / Edge"]
    end

    subgraph DNS_LAYER["DNS & Domain Layer"]
        DOMAIN["josephadogeridev.com\nDNS Records:\n• A record → Vercel/Render IP\n• SPF record (email auth)\n• DKIM record (email signing)\n• DMARC record (email policy)"]
    end

    subgraph VERCEL["Vercel — Frontend Hosting"]
        STATIC["Static Build Output\nReact + Vite → dist/\nGlobal CDN edge nodes\nAuto-HTTPS · HTTP/2"]
    end

    subgraph RENDER["Render — API Hosting"]
        NESTJS["NestJS Web Service\nNode.js 20 LTS\nAuto-deploy on main push\n• PORT = 3000\n• NODE_ENV = production"]
        BETTER_AUTH_RUNTIME["Better Auth Runtime\nSession cookie management\nPassword hashing (oslo)\nAccount lockout enforcement"]
    end

    subgraph TURSO["Turso — Cloud Database"]
        LIBSQL["LibSQL / SQLite cloud\nPrimary + edge replicas\nDrizzle ORM connection\nTURSO_DATABASE_URL + AUTH_TOKEN"]
        TABLES["Tables:\nuser · session · account\nverification · saved_spot"]
    end

    subgraph YELP["Yelp Fusion API"]
        YELP_SEARCH["GET /businesses/search\nBearer YELP_API_KEY"]
        YELP_DETAIL["GET /businesses/:id\nBearer YELP_API_KEY"]
    end

    subgraph BREVO["Brevo — Email (Production)"]
        BREVO_API["Brevo SMTP/API\nBREVO_API_KEY\nBREVO_SENDER_EMAIL\nBypass Render SMTP port block"]
    end

    subgraph UPTIME_ROBOT["Uptime Robot — Monitoring"]
        MONITOR["Health Monitor\nGET /api/health every 5 min\nKeeps Render container warm\nAlert on downtime"]
    end

    subgraph GITHUB["GitHub — CI/CD"]
        REPO["jadogeri/new-orleans-food-spots\nmain branch → auto-deploy\nPR branch → preview deploy"]
        TURBO_CACHE["Turborepo Remote Cache\n^build dependencies\nWarm build: < 1s"]
    end

    %% User traffic
    BROWSER -->|"HTTPS request"| DNS_LAYER
    DNS_LAYER -->|"/* static assets"| VERCEL
    DNS_LAYER -->|"/api/* proxy"| RENDER

    %% API dependencies
    NESTJS -->|"Drizzle ORM queries\nWSS + HTTPS"| TURSO
    LIBSQL --- TABLES
    NESTJS --- BETTER_AUTH_RUNTIME
    NESTJS -->|"HTTPS Bearer token"| YELP
    NESTJS -->|"Brevo HTTP API\nport 443"| BREVO_API
    BREVO_API -->|"DKIM / SPF lookup"| DOMAIN

    %% Deploy pipeline
    GITHUB -->|"pnpm build → deploy"| VERCEL
    GITHUB -->|"pnpm build → deploy"| RENDER
    REPO --- TURBO_CACHE

    %% Monitoring
    MONITOR -->|"GET /api/health"| RENDER

    style VERCEL fill:#0070f3,color:#fff
    style RENDER fill:#46E3B7,color:#000
    style TURSO fill:#1a1a2e,color:#fff
    style BREVO fill:#004eff,color:#fff
    style UPTIME_ROBOT fill:#f5a623,color:#000
```

---

## Environment Variables — Production vs Development

```mermaid
graph LR
    subgraph DEV["Development (.env)"]
        D1["TURSO_DATABASE_URL\nDev Turso DB URL"]
        D2["YELP_API_KEY"]
        D3["SESSION_SECRET"]
        D4["GMAIL_USER + GMAIL_APP_PASSWORD\n(dev email sending)"]
        D5["CLIENT_PORT=4000\nSERVER_PORT=3000"]
        D6["DATABASE_URL=file:local.db\n(local SQLite fallback)"]
        D7["NODE_ENV=development"]
    end

    subgraph PROD["Production (Render env vars)"]
        P1["TURSO_DATABASE_URL\nProd Turso DB URL"]
        P2["TURSO_AUTH_TOKEN\nProd Turso token"]
        P3["YELP_API_KEY"]
        P4["SESSION_SECRET\nLong random secret"]
        P5["BREVO_API_KEY\nBREVO_SENDER_EMAIL\n(prod email)"]
        P6["FRONTEND_URL\nhttps://josephadogeridev.com"]
        P7["BACKEND_URL\nhttps://nola-api.render.com"]
        P8["BETTER_AUTH_URL\nhttps://nola-api.render.com/api/auth"]
        P9["NODE_ENV=production"]
    end

    DEV -.->|"never commit .env"| PROD
```

---

## CI/CD Pipeline

```mermaid
flowchart LR
    PR["Developer opens\nPull Request"] --> CHECKS["GitHub Actions\n• pnpm install\n• pnpm run typecheck\n• pnpm run build"]
    CHECKS --> REVIEW["Code Review\n+ PR template checks"]
    REVIEW --> MERGE["Merge to main"]
    MERGE --> TURBO_BUILD["Turborepo build\nCache-aware\n^build dependency order"]
    TURBO_BUILD --> DEPLOY_FE["Vercel Deploy\nFrontend static build"]
    TURBO_BUILD --> DEPLOY_BE["Render Deploy\nNestJS API build + restart"]
    DEPLOY_FE --> LIVE["Live on\njosephadogeridev.com"]
    DEPLOY_BE --> LIVE
    DEPLOY_BE --> DB_PUSH["pnpm --filter @repo/db run push\n(schema migration if needed)"]
```
