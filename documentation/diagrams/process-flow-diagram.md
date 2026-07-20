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
    HOME[/home page/] --> SEARCH["User enters search term\n& optional filters"]
    SEARCH --> CALL_SEARCH["GET /api/spots/search\n?term=&location=New+Orleans&..."]

    CALL_SEARCH --> VALIDATE_PARAMS{"Zod validation\npassed?"}
    VALIDATE_PARAMS -- No --> ERR400["400 Bad Request\nShow field errors"]
    ERR400 --> SEARCH

    VALIDATE_PARAMS -- Yes --> CALL_YELP["Yelp Fusion API\nGET /businesses/search"]
    CALL_YELP --> YELP_RESP{"Yelp response\nstatus?"}

    YELP_RESP -- 200 OK --> MAP_RESULTS["Map to SpotDto[]\n& return to frontend"]
    MAP_RESULTS --> RESULTS_COUNT{"Results count > 0?"}
    RESULTS_COUNT -- 0 --> EMPTY_STATE["Render empty state\n'No spots found'"]
    RESULTS_COUNT -- "> 0" --> RENDER_CARDS["Render restaurant cards\nname · photo · rating · category"]
    EMPTY_STATE --> SEARCH

    YELP_RESP -- 429 Rate Limited --> ERR429["Show rate-limit toast\n'Try again shortly'"]
    ERR429 --> HOME
    YELP_RESP -- 5xx Error --> ERR502["Show error state\n502 Bad Gateway"]
    ERR502 --> HOME

    RENDER_CARDS --> USER_ACTION{"User action?"}
    USER_ACTION -- View details --> CALL_DETAIL["GET /api/spots/:yelpId\nYelp business detail"]
    CALL_DETAIL --> RENDER_DETAIL["Render detail view\nphotos · hours · address · phone"]
    RENDER_DETAIL --> USER_ACTION
    USER_ACTION -- Save spot --> SAVE_FLOW["UC7 — Save Food Spot"]
    USER_ACTION -- Search again --> SEARCH
    USER_ACTION -- Navigate away --> HOME

```

---

## 3. Save & Manage Saved Spots Flow

```mermaid
flowchart TD
    CARD[User clicks bookmark icon\non a food spot] --> AUTH_CHECK{Session\nauthenticated?}

    AUTH_CHECK -- No --> REDIRECT_LOGIN[Redirect to /sign-in\nwith return URL]
    REDIRECT_LOGIN --> LOGIN_DONE[User logs in] --> CARD

    AUTH_CHECK -- Yes --> CALL_SAVE[POST /api/spots/saved\n{yelpId, name, imageUrl, ...}]
    CALL_SAVE --> ALREADY_SAVED{409 conflict?\nSpot already saved?}

    ALREADY_SAVED -- Yes --> TOAST_EXISTS[Show "Already in saved spots"\ntoast — no change]
    ALREADY_SAVED -- No 201 --> INSERT_ROW[INSERT INTO saved_spot]
    INSERT_ROW --> BOOKMARK_UPDATE[Update bookmark icon to filled\nShow success toast]

    BOOKMARK_UPDATE --> VIEW_SAVED{User navigates\nto /saved?}
    VIEW_SAVED -- No --> CONTINUE[Continue browsing]
    VIEW_SAVED -- Yes --> CALL_SAVED[GET /api/spots/saved\nSELECT WHERE userId = ?]
    CALL_SAVED --> SAVED_COUNT{Saved spots\ncount > 0?}

    SAVED_COUNT -- 0 --> EMPTY_SAVED[Render empty state\n"No saved spots yet — explore!"]
    SAVED_COUNT -- > 0 --> RENDER_SAVED[Render saved spots grid\nwith Remove button]

    RENDER_SAVED --> REMOVE_ACTION{User clicks Remove?}
    REMOVE_ACTION -- No --> CONTINUE
    REMOVE_ACTION -- Yes --> CALL_DELETE[DELETE /api/spots/saved/:id\nWHERE id=? AND userId=?]
    CALL_DELETE --> DELETE_RESP{Response?}
    DELETE_RESP -- 204 No Content --> REMOVE_CARD[Remove card from list\nShow removal toast]
    DELETE_RESP -- 404 Not Found --> ERR_TOAST[Show error toast]
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
