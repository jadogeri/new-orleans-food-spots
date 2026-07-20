# Use Case Descriptions

> Detailed structured descriptions for each use case identified in the Use Case Diagram.

---

## UC1 — Register

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC1 |
| **Use Case Name** | Register |
| **Actor(s)** | Guest |
| **Description** | A new visitor creates a NOLA Spots account by providing their name, email address, and a password. The system hashes the password, persists the account, and sends a welcome / verification email. |
| **Preconditions** | Guest is on the `/sign-up` page. The API server is reachable. |
| **Postconditions** | A new User row exists in the database. A session cookie is set. The user is redirected to `/home`. A welcome email is dispatched. |
| **Main Flow** | 1. Guest navigates to `/sign-up`. 2. Guest enters name, email, and password. 3. Guest clicks "Create Account". 4. Frontend calls `POST /api/auth/sign-up/email`. 5. API validates input (Zod). 6. API hashes password and inserts User row. 7. API creates a session and sets the session cookie. 8. API triggers UC11 (Receive Email Notifications — welcome email). 9. Frontend redirects to `/home`. |
| **Alternate Flows** | **A1 — Email Already Registered:** API returns 422; frontend shows "Email already in use" error. |
| **Exception Flows** | **E1 — Validation Failure:** Missing or malformed fields return 400; frontend shows field-level errors. **E2 — DB Error:** API returns 500; frontend shows a generic error toast. |
| **Business Rules** | Email must be unique. Password must meet minimum length requirements enforced by Better Auth. |

---

## UC2 — Log In

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC2 |
| **Use Case Name** | Log In |
| **Actor(s)** | Guest |
| **Description** | A returning user authenticates with their email and password to obtain a session. |
| **Preconditions** | Guest is on the `/sign-in` page. The user account already exists. |
| **Postconditions** | A session row is inserted. A session cookie is set on the browser. The user is redirected to `/home`. |
| **Main Flow** | 1. Guest navigates to `/sign-in`. 2. Guest enters email and password, clicks "Sign In". 3. Frontend calls `POST /api/auth/sign-in/email`. 4. API looks up user by email. 5. API verifies password hash. 6. API resets `loginAttempts` and `lockedUntil`. 7. API inserts session row and sets cookie. 8. Frontend redirects to `/home`. |
| **Alternate Flows** | **A1 — Wrong Password (< 5 attempts):** API increments `loginAttempts`, returns 401; frontend shows error toast. **A2 — Account Locked:** API returns 423; frontend shows lockout duration. |
| **Exception Flows** | **E1 — API Unreachable:** Frontend shows connection error. |
| **Business Rules** | Account is locked after 5 consecutive failed attempts. Lockout duration is configurable via Better Auth settings. |

---

## UC3 — Log Out

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC3 |
| **Use Case Name** | Log Out |
| **Actor(s)** | Registered User |
| **Description** | An authenticated user ends their current session, clearing the server-side session record and the browser cookie. |
| **Preconditions** | A valid session cookie exists in the browser. |
| **Postconditions** | The session row is deleted from the database. The session cookie is cleared. The user is redirected to `/sign-in`. |
| **Main Flow** | 1. User clicks "Log Out". 2. Frontend calls `POST /api/auth/sign-out`. 3. API deletes the session row. 4. API clears the session cookie. 5. Frontend redirects to `/sign-in`. |
| **Alternate Flows** | None. |
| **Exception Flows** | **E1 — Session Already Expired:** API returns 401; frontend redirects to `/sign-in` regardless. |
| **Business Rules** | Sessions expire server-side after the configured TTL even without explicit logout. |

---

## UC4 — Reset Password

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC4 |
| **Use Case Name** | Reset Password |
| **Actor(s)** | Guest, Email Service |
| **Description** | A user who has forgotten their password requests a one-time reset link sent to their registered email address. |
| **Preconditions** | Guest is on the `/forgot-password` page. |
| **Postconditions** | A verification token is stored. The reset email is dispatched. The user's password is updated after they complete the flow. |
| **Main Flow** | 1. Guest enters their email and clicks "Send Reset Link". 2. Frontend calls `POST /api/auth/forget-password`. 3. API looks up user (silently ignores unknown emails to prevent enumeration). 4. API inserts a time-limited verification token. 5. API calls UC11 (Receive Email Notifications — reset link). 6. Guest clicks the link in the email, navigates to `/reset-password?token=...`. 7. Guest enters new password, clicks "Reset". 8. Frontend calls `POST /api/auth/reset-password`. 9. API validates token expiry. 10. API hashes and saves new password, deletes verification row. 11. Frontend redirects to `/sign-in`. |
| **Alternate Flows** | **A1 — Token Expired:** API returns 400; frontend shows "Link has expired — request a new one". |
| **Exception Flows** | **E1 — Email Delivery Failure:** API logs the error; user is advised to retry. |
| **Business Rules** | Reset tokens expire after 1 hour. Each token is single-use. |

---

## UC5 — Search Food Spots

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC5 |
| **Use Case Name** | Search Food Spots |
| **Actor(s)** | Guest, Registered User, Yelp Fusion API |
| **Description** | A user (authenticated or not) enters a search term and optional filters to discover New Orleans restaurants and food spots from the Yelp Fusion API. |
| **Preconditions** | The user is on the `/search` page. The Yelp Fusion API is reachable and the `YELP_API_KEY` is configured. |
| **Postconditions** | A list of matching food spots is rendered for the user. |
| **Main Flow** | 1. User types a search term (e.g. "beignets", "crawfish étouffée") and optionally selects category or price filters. 2. User submits the search. 3. Frontend calls `GET /api/spots/search?term=<query>&location=New+Orleans&...`. 4. API validates query params with Zod. 5. API calls Yelp Fusion `GET /businesses/search` with the user's parameters. 6. Yelp returns a list of business objects. 7. API maps Yelp response to `SpotDto[]`. 8. Frontend renders restaurant cards showing name, photo, rating, category, price, and address. |
| **Alternate Flows** | **A1 — No Results:** API returns empty array; frontend renders "No spots found" empty state. |
| **Exception Flows** | **E1 — Yelp API Rate Limited (429):** API returns 429; frontend shows "Too many searches — try again shortly". **E2 — Yelp API Error:** API returns 502; frontend shows error state. |
| **Business Rules** | Location is always fixed to "New Orleans, LA" in the server-side Yelp call. The user may not override the location. |

---

## UC6 — View Food Spot Details

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC6 |
| **Use Case Name** | View Food Spot Details |
| **Actor(s)** | Guest, Registered User, Yelp Fusion API |
| **Description** | A user views full details for a specific food spot, including photos, hours, reviews summary, address, and a map link. |
| **Preconditions** | A food spot card or link is visible. The Yelp Fusion API is reachable. |
| **Postconditions** | A detail page or modal is rendered for the selected business. |
| **Main Flow** | 1. User clicks on a food spot card. 2. Frontend calls `GET /api/spots/:yelpId`. 3. API calls Yelp Fusion `GET /businesses/:id`. 4. Yelp returns full business details. 5. API maps to `SpotDetailDto` and returns to frontend. 6. Frontend renders the detail view. |
| **Alternate Flows** | **A1 — Business Closed Permanently:** Yelp returns a closed flag; frontend displays a "Permanently closed" banner. |
| **Exception Flows** | **E1 — Yelp API Error:** Frontend renders cached data from `SavedSpot` if the spot is saved; otherwise shows an error state. |
| **Business Rules** | Photos and reviews are fetched live and are never cached server-side. |

---

## UC7 — Save Food Spot

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC7 |
| **Use Case Name** | Save Food Spot |
| **Actor(s)** | Registered User |
| **Description** | An authenticated user bookmarks a food spot for later reference. Key business fields are persisted to the database so the spot remains accessible even when the Yelp API is unavailable. |
| **Preconditions** | The user is authenticated. The food spot is visible on the search results or detail page. |
| **Postconditions** | A `SavedSpot` row is inserted for the user. The bookmark icon updates to a filled state. |
| **Main Flow** | 1. User clicks the bookmark/heart icon on a food spot. 2. Frontend calls `POST /api/spots/saved` with spot metadata. 3. API authenticates the session cookie. 4. API checks whether the spot is already saved for this user. 5. API inserts a `SavedSpot` row. 6. API returns 201 with the new `SavedSpot`. 7. Frontend updates the bookmark icon and shows a success toast. |
| **Alternate Flows** | **A1 — Already Saved:** API returns 409; frontend shows "Already in your saved spots". |
| **Exception Flows** | **E1 — Not Authenticated (UC2 include):** API returns 401; frontend redirects to `/sign-in`. |
| **Business Rules** | Each user may save the same Yelp business only once (`UNIQUE(userId, yelpId)` constraint). |

---

## UC8 — View Saved Spots

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC8 |
| **Use Case Name** | View Saved Spots |
| **Actor(s)** | Registered User |
| **Description** | An authenticated user views their personal collection of saved food spots, sorted by most recently saved. |
| **Preconditions** | The user is authenticated. |
| **Postconditions** | The saved spots list is displayed. |
| **Main Flow** | 1. User navigates to `/saved`. 2. Frontend calls `GET /api/spots/saved`. 3. API authenticates session. 4. API queries `SELECT * FROM saved_spot WHERE userId = ? ORDER BY createdAt DESC`. 5. API returns `SavedSpot[]`. 6. Frontend renders the list of saved spot cards. |
| **Alternate Flows** | **A1 — Empty List:** Frontend renders an empty state with a prompt to search for spots. |
| **Exception Flows** | **E1 — Not Authenticated:** API returns 401; frontend redirects to `/sign-in`. |
| **Business Rules** | Results are always scoped to the authenticated user. |

---

## UC9 — Remove Saved Spot

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC9 |
| **Use Case Name** | Remove Saved Spot |
| **Actor(s)** | Registered User |
| **Description** | An authenticated user removes a food spot from their saved collection. |
| **Preconditions** | The user is authenticated. The `SavedSpot` row exists and belongs to this user. |
| **Postconditions** | The `SavedSpot` row is deleted. The card is removed from the UI. |
| **Main Flow** | 1. User clicks "Remove" on a saved spot card. 2. Frontend calls `DELETE /api/spots/saved/:id`. 3. API authenticates session. 4. API deletes the row scoped to `userId`. 5. API returns 204 No Content. 6. Frontend removes the card and shows a toast. |
| **Alternate Flows** | None. |
| **Exception Flows** | **E1 — Not Authenticated:** API returns 401; frontend redirects to `/sign-in`. **E2 — Not Found / Wrong User:** API returns 404. |
| **Business Rules** | Delete is always scoped to `WHERE id = ? AND userId = ?` to prevent cross-user deletion. |

---

## UC10 — Manage Profile

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC10 |
| **Use Case Name** | Manage Profile |
| **Actor(s)** | Registered User |
| **Description** | An authenticated user updates their display name, profile image, or other account-level settings. |
| **Preconditions** | The user is authenticated. |
| **Postconditions** | The User row is updated in the database. |
| **Main Flow** | 1. User navigates to `/profile`. 2. Frontend calls `GET /api/auth/get-session` to pre-fill fields. 3. User edits their name or image URL, clicks "Save". 4. Frontend calls `POST /api/auth/update-user`. 5. API validates input. 6. API updates the User row. 7. API returns updated user object. 8. Frontend shows success toast. |
| **Alternate Flows** | None. |
| **Exception Flows** | **E1 — Validation Failure:** API returns 400; frontend shows field errors. |
| **Business Rules** | Email address cannot be changed in the current version without re-verification. |

---

## UC11 — Receive Email Notifications

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC11 |
| **Use Case Name** | Receive Email Notifications |
| **Actor(s)** | Registered User, Email Service (Brevo / Gmail) |
| **Description** | The system sends transactional emails to users for account-lifecycle events (welcome, password reset, email verification). |
| **Preconditions** | A triggering event occurs (registration, password reset request). The email service credentials are configured. |
| **Postconditions** | An email is delivered to the user's inbox. |
| **Main Flow** | 1. A triggering event fires on the server (UC1 Register, UC4 Reset Password). 2. NestJS Mail Module renders the appropriate Handlebars email template. 3. In development: email is sent via Gmail SMTP. 4. In production: email is sent via Brevo API (bypassing blocked SMTP ports on Render). 5. User receives email in their inbox. |
| **Alternate Flows** | None. |
| **Exception Flows** | **E1 — Email Delivery Failure:** Server logs the error; the primary user action (registration/reset) still succeeds — email is best-effort. |
| **Business Rules** | Production email must use Brevo API because Render blocks outbound SMTP ports (25, 465, 587). SPF, DKIM, and DMARC records on `josephadogeridev.com` ensure deliverability. |

---

## UC12 — Verify Email Address

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC12 |
| **Use Case Name** | Verify Email Address |
| **Actor(s)** | Registered User |
| **Description** | A newly registered user clicks the verification link in their welcome email to confirm ownership of their email address. |
| **Preconditions** | The user has registered (UC1). A verification email has been dispatched. The verification token has not expired. |
| **Postconditions** | `user.emailVerified` is set to `true`. The verification row is deleted. |
| **Main Flow** | 1. User clicks the verification link in the welcome email. 2. Browser navigates to `/verify-email?token=...`. 3. Frontend calls `GET /api/auth/verify-email?token=...`. 4. API looks up the verification row, checks expiry. 5. API sets `emailVerified = true` on the User row. 6. API deletes the verification row. 7. Frontend shows "Email verified!" and redirects to `/home`. |
| **Alternate Flows** | None. |
| **Exception Flows** | **E1 — Token Expired:** API returns 400; frontend prompts to request a new verification email. |
| **Business Rules** | Verification tokens expire after 24 hours. Unverified users may still log in but see a verification prompt. |
