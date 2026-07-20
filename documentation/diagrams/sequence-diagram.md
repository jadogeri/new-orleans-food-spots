# Sequence Diagram

> **Tool:** Mermaid — paste into [mermaid.live](https://mermaid.live) or any Mermaid-compatible renderer.

## 1. User Registration & Email Verification Sequence

```mermaid
sequenceDiagram
    actor Guest
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant DB as Database (Turso / LibSQL)
    participant Mail as Email Service (Brevo / Gmail)

    Guest->>FE: Fill registration form (name, email, password)
    FE->>API: POST /api/auth/sign-up/email { name, email, password }
    API->>API: Hash password (oslo/password)
    API->>DB: INSERT INTO user (name, email, hashedPassword)
    DB-->>API: { id, name, email, createdAt }
    API->>Mail: Send welcome / verification email (Handlebars template)
    Mail-->>API: 202 Accepted
    API-->>FE: 200 OK — session cookie set
    FE->>Guest: Redirect to /home or /verify-email
```

---

## 2. User Login Sequence

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant DB as Database (Turso / LibSQL)

    User->>FE: Enter email + password, click "Sign In"
    FE->>API: POST /api/auth/sign-in/email { email, password }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User row

    alt Invalid credentials or account locked
        API-->>FE: 401 Unauthorized
        FE->>User: Show error toast
    else Valid credentials
        API->>API: Verify password hash
        API->>DB: Reset loginAttempts = 0, lockedUntil = null
        API->>DB: INSERT INTO session (userId, token, expiresAt)
        DB-->>API: Session row
        API-->>FE: 200 OK — Set-Cookie: session token
        FE->>User: Redirect to /home
    end
```

---

## 3. Search Food Spots Sequence

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant Yelp as Yelp Fusion API

    User->>FE: Type search query + optional filters, press Search
    FE->>API: GET /api/spots/search?term=<query>&location=New+Orleans&...
    API->>API: Validate query params (Zod)
    API->>Yelp: GET /businesses/search?term=<query>&location=New+Orleans (Bearer YELP_API_KEY)
    Yelp-->>API: { businesses: [...] }
    API->>API: Map Yelp response → SpotDto[]
    API-->>FE: 200 OK — SpotDto[]
    FE->>User: Render restaurant cards (name, image, rating, address, categories)
```

---

## 4. Save a Food Spot Sequence

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant DB as Database (Turso / LibSQL)

    User->>FE: Click "Save" on a restaurant card
    FE->>API: POST /api/spots/saved { yelpId, name, imageUrl, rating, reviewCount, categories, address, phone, url, latitude, longitude }
    API->>API: Authenticate session cookie (Better Auth middleware)

    alt Not authenticated
        API-->>FE: 401 Unauthorized
        FE->>User: Redirect to /sign-in
    else Authenticated
        API->>DB: SELECT FROM saved_spot WHERE userId = ? AND yelpId = ?
        alt Already saved
            API-->>FE: 409 Conflict
            FE->>User: Show "Already saved" toast
        else Not yet saved
            DB-->>API: null
            API->>DB: INSERT INTO saved_spot (userId, yelpId, name, imageUrl, ...)
            DB-->>API: SavedSpot row
            API-->>FE: 201 Created — SavedSpot
            FE->>User: Update bookmark icon, show success toast
        end
    end
```

---

## 5. View & Remove Saved Spots Sequence

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant DB as Database (Turso / LibSQL)

    User->>FE: Navigate to /saved
    FE->>API: GET /api/spots/saved
    API->>API: Authenticate session
    API->>DB: SELECT * FROM saved_spot WHERE userId = ? ORDER BY createdAt DESC
    DB-->>API: SavedSpot[]
    API-->>FE: 200 OK — SavedSpot[]
    FE->>User: Render saved spots list

    User->>FE: Click "Remove" on a saved spot
    FE->>API: DELETE /api/spots/saved/:id
    API->>DB: DELETE FROM saved_spot WHERE id = ? AND userId = ?
    DB-->>API: Affected rows
    API-->>FE: 204 No Content
    FE->>User: Remove card from list, show success toast
```

---

## 6. Password Reset Sequence

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React / Vite)
    participant API as API Server (NestJS)
    participant DB as Database (Turso / LibSQL)
    participant Mail as Email Service (Brevo / Gmail)

    User->>FE: Click "Forgot Password", enter email
    FE->>API: POST /api/auth/forget-password { email }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User row (or null — silently ignore unknown emails)
    API->>DB: INSERT INTO verification (identifier, value, expiresAt)
    API->>Mail: Send password-reset email (reset link + token)
    Mail-->>API: 202 Accepted
    API-->>FE: 200 OK

    User->>FE: Click link in email, enter new password
    FE->>API: POST /api/auth/reset-password { token, newPassword }
    API->>DB: SELECT verification WHERE value = token AND expiresAt > now
    DB-->>API: Verification row
    API->>API: Hash new password
    API->>DB: UPDATE user SET hashedPassword = ?
    API->>DB: DELETE FROM verification WHERE id = ?
    API-->>FE: 200 OK
    FE->>User: Show success toast, redirect to /sign-in
```
