# Process Flow Diagram

> **Tool:** Mermaid — paste into [mermaid.live](https://mermaid.live) or any Mermaid-compatible renderer.

## 1. User Authentication Flow

```mermaid
flowchart TD
    START([User visits NOLA Spots]) --> AUTHENTICATED{Session cookie\nvalid?}

    AUTHENTICATED -- Yes --> HOME[/home — Feed & Search/]
    AUTHENTICATED -- No --> LANDING[Landing / Sign-In Page]

    LANDING --> CHOICE{New or\nreturning user?}
    CHOICE -- New --> SIGNUP[/sign-up page/]
    CHOICE -- Returning --> SIGNIN[/sign-in page/]
    CHOICE -- Forgot password --> FORGOT[/forgot-password page/]

    SIGNUP --> VALIDATE_REG{Form valid?}
    VALIDATE_REG -- No --> SIGNUP
    VALIDATE_REG -- Yes --> CALL_REGISTER[POST /api/auth/sign-up/email]
    CALL_REGISTER --> REG_OK{Success?}
    REG_OK -- No 422 email taken --> SIGNUP
    REG_OK -- Yes 200 --> SEND_WELCOME[Dispatch welcome email\nvia Email Service]
    SEND_WELCOME --> SESSION_SET[Set session cookie]
    SESSION_SET --> HOME

    SIGNIN --> VALIDATE_LOGIN{Credentials\nvalid?}
    VALIDATE_LOGIN -- No --> ATTEMPT_COUNT{Failed attempts\n>= 5?}
    ATTEMPT_COUNT -- Yes --> LOCKED[Show lockout message\n& remaining time]
    LOCKED --> SIGNIN
    ATTEMPT_COUNT -- No --> SIGNIN
    VALIDATE_LOGIN -- Yes --> RESET_ATTEMPTS[Reset loginAttempts = 0]
    RESET_ATTEMPTS --> INSERT_SESSION[INSERT session row]
    INSERT_SESSION --> SESSION_SET

    FORGOT --> SEND_RESET[POST /api/auth/forget-password]
    SEND_RESET --> EMAIL_SENT[Dispatch reset link email]
    EMAIL_SENT --> RESET_LINK[User clicks link\nin email]
    RESET_LINK --> TOKEN_VALID{Token valid\n& not expired?}
    TOKEN_VALID -- No --> FORGOT
    TOKEN_VALID -- Yes --> NEW_PASSWORD[/reset-password page/]
    NEW_PASSWORD --> SAVE_PASSWORD[POST /api/auth/reset-password\nHash & save new password]
    SAVE_PASSWORD --> SIGNIN
```

---

## 2. Search & Discover Flow

```mermaid
flowchart TD
    CARD["User clicks bookmark icon\non a food spot"] --> AUTH_CHECK{"Session\nauthenticated?"}

    AUTH_CHECK -- No --> REDIRECT_LOGIN["Redirect to /sign-in\nwith return URL"]
    REDIRECT_LOGIN --> LOGIN_DONE["User logs in"] --> CARD

    AUTH_CHECK -- Yes --> CALL_SAVE["POST /api/spots/saved\n {yelpId, name, imageUrl, ...}"]
    CALL_SAVE --> ALREADY_SAVED{"409 conflict?\nSpot already saved?"}

    ALREADY_SAVED -- Yes --> TOAST_EXISTS["Show #quot;Already in saved spots#quot;\ntoast — no change"]
    ALREADY_SAVED -- "No 201" --> INSERT_ROW["INSERT INTO saved_spot"]
    INSERT_ROW --> BOOKMARK_UPDATE["Update bookmark icon to filled\nShow success toast"]

    BOOKMARK_UPDATE --> VIEW_SAVED{"User navigates\nto /saved?"}
    VIEW_SAVED -- No --> CONTINUE["Continue browsing"]
    VIEW_SAVED -- Yes --> CALL_SAVED["GET /api/spots/saved\nSELECT WHERE userId = ?"]
    CALL_SAVED --> SAVED_COUNT{"Saved spots count > 0?"}

    SAVED_COUNT -- 0 --> EMPTY_SAVED["Render empty state\n#quot;No saved spots yet — explore!#quot;"]
    SAVED_COUNT -- "> 0" --> RENDER_SAVED["Render saved spots grid\nwith Remove button"]

    RENDER_SAVED --> REMOVE_ACTION{"User clicks Remove?"}
    REMOVE_ACTION -- No --> CONTINUE
    REMOVE_ACTION -- Yes --> CALL_DELETE["DELETE /api/spots/saved/:id\nWHERE id=? AND userId=?"]
    CALL_DELETE --> DELETE_RESP{"Response?"}
    DELETE_RESP -- 204 No Content --> REMOVE_CARD["Remove card from list\nShow removal toast"]
    DELETE_RESP -- 404 Not Found --> ERR_TOAST["Show error toast"]
    REMOVE_CARD --> RENDER_SAVED
    ERR_TOAST --> RENDER_SAVED

```

---

## 3. Save & Manage Saved Spots Flow

```mermaid
flowchart TD
    CARD["User clicks bookmark icon\non a food spot"] --> AUTH_CHECK{"Session\nauthenticated?"}

    AUTH_CHECK -- No --> REDIRECT_LOGIN["Redirect to /sign-in\nwith return URL"]
    REDIRECT_LOGIN --> LOGIN_DONE["User logs in"] --> CARD

    AUTH_CHECK -- Yes --> CALL_SAVE["POST /api/spots/saved\n{yelpId, name, imageUrl, ...}"]
    CALL_SAVE --> ALREADY_SAVED{"409 conflict?\nSpot already saved?"}

    ALREADY_SAVED -- Yes --> TOAST_EXISTS["Show 'Already in saved spots'\ntoast — no change"]
    ALREADY_SAVED -- "No 201" --> INSERT_ROW["INSERT INTO saved_spot"]
    INSERT_ROW --> BOOKMARK_UPDATE["Update bookmark icon to filled\nShow success toast"]

    BOOKMARK_UPDATE --> VIEW_SAVED{"User navigates\nto /saved?"}
    VIEW_SAVED -- No --> CONTINUE["Continue browsing"]
    VIEW_SAVED -- Yes --> CALL_SAVED["GET /api/spots/saved\nSELECT WHERE userId = ?"]
    CALL_SAVED --> SAVED_COUNT{"Saved spots count > 0?"}

    SAVED_COUNT -- 0 --> EMPTY_SAVED["Render empty state\n'No saved spots yet — explore!'"]
    SAVED_COUNT -- "> 0" --> RENDER_SAVED["Render saved spots grid\nwith Remove button"]

    RENDER_SAVED --> REMOVE_ACTION{"User clicks Remove?"}
    REMOVE_ACTION -- No --> CONTINUE
    REMOVE_ACTION -- Yes --> CALL_DELETE["DELETE /api/spots/saved/:id\nWHERE id=? AND userId=?"]
    CALL_DELETE --> DELETE_RESP{"Response?"}
    DELETE_RESP -- 204 No Content --> REMOVE_CARD["Remove card from list\nShow removal toast"]
    DELETE_RESP -- 404 Not Found --> ERR_TOAST["Show error toast"]
    REMOVE_CARD --> RENDER_SAVED
    ERR_TOAST --> RENDER_SAVED

```

---

## 4. Email Notification Lifecycle

```mermaid
flowchart TD
    CARD["User clicks bookmark icon\non a food spot"] --> AUTH_CHECK{"Session\nauthenticated?"}

    AUTH_CHECK -- No --> REDIRECT_LOGIN["Redirect to /sign-in\nwith return URL"]
    REDIRECT_LOGIN --> LOGIN_DONE["User logs in"] --> CARD

    AUTH_CHECK -- Yes --> CALL_SAVE["POST /api/spots/saved\n{yelpId, name, imageUrl, ...}"]
    CALL_SAVE --> ALREADY_SAVED{"409 conflict?\nSpot already saved?"}

    ALREADY_SAVED -- Yes --> TOAST_EXISTS["Show 'Already in saved spots'\ntoast — no change"]
    ALREADY_SAVED -- "No 201" --> INSERT_ROW["INSERT INTO saved_spot"]
    INSERT_ROW --> BOOKMARK_UPDATE["Update bookmark icon to filled\nShow success toast"]

    BOOKMARK_UPDATE --> VIEW_SAVED{"User navigates\nto /saved?"}
    VIEW_SAVED -- No --> CONTINUE["Continue browsing"]
    VIEW_SAVED -- Yes --> CALL_SAVED["GET /api/spots/saved\nSELECT WHERE userId = ?"]
    CALL_SAVED --> SAVED_COUNT{"Saved spots count > 0?"}

    SAVED_COUNT -- 0 --> EMPTY_SAVED["Render empty state\n'No saved spots yet — explore!'"]
    SAVED_COUNT -- "> 0" --> RENDER_SAVED["Render saved spots grid\nwith Remove button"]

    RENDER_SAVED --> REMOVE_ACTION{"User clicks Remove?"}
    REMOVE_ACTION -- No --> CONTINUE
    REMOVE_ACTION -- Yes --> CALL_DELETE["DELETE /api/spots/saved/:id\nWHERE id=? AND userId=?"]
    CALL_DELETE --> DELETE_RESP{"Response?"}
    DELETE_RESP -- 204 No Content --> REMOVE_CARD["Remove card from list\nShow removal toast"]
    DELETE_RESP -- 404 Not Found --> ERR_TOAST["Show error toast"]
    REMOVE_CARD --> RENDER_SAVED
    ERR_TOAST --> RENDER_SAVED

```
