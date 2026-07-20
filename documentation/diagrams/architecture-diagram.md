# Architecture Layer Diagram

> **Tool:** Mermaid — paste into [mermaid.live](https://mermaid.live) or any Mermaid-compatible renderer.

## System Architecture — Layer View

```mermaid
graph TB
    subgraph CLIENT["Presentation Layer — React + Vite (port 4000)"]
        direction TB
        PAGES["Pages\n/home · /search · /saved · /sign-in · /sign-up\n/forgot-password · /reset-password · /profile · /verify-email"]
        COMPONENTS["UI Components\nSpotCard · BookmarkButton · SearchBar\nAuthForm · ProfileForm · EmptyState · Navbar"]
        HOOKS["Custom Hooks\nuseAuth · useSavedSpots · useSearch\nuseSpotDetail"]
        QUERY["TanStack Query\nQuery cache · Mutations\nOptimistic updates"]
        PAGES --> COMPONENTS
        COMPONENTS --> HOOKS
        HOOKS --> QUERY
    end

    subgraph API["Application Layer — NestJS (port 3000)"]
        direction TB
        AUTH_MODULE["Auth Module\nBetter Auth integration\nSession management · Password hashing\nAccount lockout · Email triggers"]
        SPOTS_MODULE["Spots Module\nSearch controller · Saved spots controller\nYelp Fusion API proxy · SpotDto mapping"]
        MAIL_MODULE["Mail Module\nHandlebars templates · Gmail (dev)\nBrevo API (production)"]
        HEALTH["Health Module\nGET /api/health — liveness check"]
        VALIDATION["Zod Validation\nRequest param & body validation\nResponse shape enforcement"]
        AUTH_MODULE --- VALIDATION
        SPOTS_MODULE --- VALIDATION
    end

    subgraph DATA["Data Layer — Drizzle ORM + Turso / LibSQL"]
        direction TB
        USER_TBL["user\nid · name · email · emailVerified\nimage · createdAt · updatedAt"]
        SESSION_TBL["session\nid · userId · token · expiresAt\nipAddress · userAgent · createdAt"]
        ACCOUNT_TBL["account\nid · userId · accountId · providerId\naccessToken · refreshToken · password"]
        VERIFY_TBL["verification\nid · identifier · value · expiresAt\ncreatedAt · updatedAt"]
        SAVED_TBL["saved_spot\nid · userId · yelpId · name\nimageUrl · rating · reviewCount\ncategories · address · phone\nurl · latitude · longitude · createdAt"]
    end

    subgraph EXTERNAL["External Services"]
        YELP["Yelp Fusion API\nbusinesses/search\nbusinesses/:id"]
        EMAIL_SVC["Email Service\nBrevo API (production)\nGmail SMTP (development)"]
    end

    subgraph INFRA["Infrastructure Layer"]
        RENDER["Render\nNestJS API server\nWeb service (auto-scale)"]
        TURSO["Turso\nLibSQL cloud database\nGlobal edge replicas"]
        UPTIME["Uptime Robot\nExternal health monitor\nKeeps Render container warm"]
        DNS["josephadogeridev.com\nSPF · DKIM · DMARC\nEmail DNS records"]
    end

    QUERY -->|"REST calls — fetch()\nBASE_URL = VITE_API_URL"| API
    AUTH_MODULE -->|"Drizzle ORM queries"| DATA
    SPOTS_MODULE -->|"Drizzle ORM queries"| DATA
    SPOTS_MODULE -->|"HTTPS — Bearer YELP_API_KEY"| YELP
    MAIL_MODULE -->|"Brevo API / SMTP"| EMAIL_SVC
    EMAIL_SVC -->|"DNS auth lookup"| DNS
    API -->|"deployed on"| RENDER
    DATA -->|"hosted on"| TURSO
    UPTIME -->|"pings GET /api/health"| RENDER
```

---

## Request Routing — Path-Based Proxy

```mermaid
graph LR
    BROWSER["Browser\n:80 / :443"] --> PROXY["Reverse Proxy\n(Turborepo / Render routing)"]
    PROXY -->|"/api/*"| NEST["NestJS API Server\n:3000"]
    PROXY -->|"/* (all other)"| VITE["React Vite Client\n:4000"]
    NEST -->|"Better Auth routes\n/api/auth/*"| BETTER_AUTH["Better Auth\ninternal handler"]
    NEST -->|"Yelp proxy\n/api/spots/search"| YELP_CALL["Yelp Fusion API"]
    NEST -->|"Drizzle ORM"| DB["Turso DB"]
```

---

## NestJS Module Dependency Graph

```mermaid
graph TD
    APP_MODULE["AppModule\n(root)"]
    CONFIG["ConfigModule\nglobal env vars"]
    DB_MODULE["DatabaseModule\nDrizzle client singleton"]
    AUTH_MOD["AuthModule\nBetter Auth config\nAuthController · AuthService"]
    SPOTS_MOD["SpotsModule\nSpotsController · SpotsService"]
    SAVED_MOD["SavedSpotsModule\nSavedSpotsController\nSavedSpotsService"]
    MAIL_MOD["MailModule\nMailService\nHandlebars templates"]
    HEALTH_MOD["HealthModule\nHealthController"]

    APP_MODULE --> CONFIG
    APP_MODULE --> DB_MODULE
    APP_MODULE --> AUTH_MOD
    APP_MODULE --> SPOTS_MOD
    APP_MODULE --> SAVED_MOD
    APP_MODULE --> MAIL_MOD
    APP_MODULE --> HEALTH_MOD

    AUTH_MOD --> DB_MODULE
    AUTH_MOD --> MAIL_MOD
    SPOTS_MOD --> DB_MODULE
    SAVED_MOD --> DB_MODULE
    SAVED_MOD --> AUTH_MOD
```
