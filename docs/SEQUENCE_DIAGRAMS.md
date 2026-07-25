# OneVriksh Accounts - Enterprise Sequence Diagrams

This document contains visual sequence diagrams illustrating the end-to-end authentication, authorization, token lifecycle, and session management workflows.

---

## 1. OAuth 2.1 Authorization Code Flow with PKCE & Consent

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Client Application (study.onevriksh.in)
    participant IdP_FE as IdP Frontend (accounts.onevriksh.in)
    participant IdP_BE as IdP Express Backend
    participant DB as MongoDB Database

    Note over App: 1. Generate code_verifier & S256 code_challenge
    User->>App: Click "Sign in with OneVriksh"
    App->>IdP_FE: Redirect to /oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=openid profile email offline_access&state=xyz123&code_challenge=S256_HASH&code_challenge_method=S256
    
    IdP_FE->>IdP_BE: GET /api/oauth/authorize (Session Cookie)
    IdP_BE->>DB: Validate client_id & redirect_uri
    
    alt User Not Logged In
        IdP_BE-->>IdP_FE: Unauthenticated
        IdP_FE-->>User: Display Login Page
        User->>IdP_FE: Enter Credentials
        IdP_FE->>IdP_BE: POST /api/auth/login
        IdP_BE-->>IdP_FE: Login Success + Set HTTP-Only Session Cookie
    end

    IdP_BE->>DB: Check User Consent (ConnectedApp model)
    alt Consent Required
        IdP_BE-->>IdP_FE: Render Consent Dialog (Scopes requested)
        IdP_FE-->>User: Display Scope Consent Screen
        User->>IdP_FE: Click "Allow & Continue"
        IdP_FE->>IdP_BE: POST /api/oauth/authorize (Approve)
        IdP_BE->>DB: Save User Consent (ConnectedApp)
    end

    IdP_BE->>DB: Store AuthorizationCode (code_hash, client_id, user_id, code_challenge, S256, expires_in: 5m)
    IdP_BE-->>IdP_FE: Redirect URL with authorization code & state
    IdP_FE-->>App: Redirect to redirect_uri?code=AUTH_CODE_123&state=xyz123

    Note over App: 2. Exchange Authorization Code for Tokens
    App->>IdP_BE: POST /api/oauth/token (grant_type=authorization_code, client_id, code=AUTH_CODE_123, redirect_uri, code_verifier)
    IdP_BE->>DB: Fetch & Validate AuthorizationCode
    IdP_BE->>IdP_BE: Verify SHA256(code_verifier) == code_challenge
    IdP_BE->>DB: Mark AuthorizationCode as used
    IdP_BE->>DB: Issue AccessToken + RefreshToken (Family ID) + ID Token (RS256 signed via JWKS)
    IdP_BE-->>App: Return { access_token, refresh_token, id_token, token_type: "Bearer", expires_in }
    App-->>User: Authenticated SSO Session Active!
```

---

## 2. Refresh Token Rotation & Replay Attack Detection

```mermaid
sequenceDiagram
    autonumber
    actor App as Client Application
    participant IdP_BE as IdP Express Backend
    participant DB as MongoDB Database

    Note over App: Access Token Expired, Refreshing...
    App->>IdP_BE: POST /api/oauth/token (grant_type=refresh_token, refresh_token=RT_V1, client_id)
    IdP_BE->>DB: Find RefreshToken by SHA-256 hash (RT_V1)
    
    alt Token Revoked / Replay Attack Detected
        Note over DB, IdP_BE: RT_V1 was ALREADY used & replaced! (Replay Attack)
        IdP_BE->>DB: Revoke ALL RefreshTokens in same Family ID!
        IdP_BE-->>App: 400 Bad Request { error: "invalid_grant", error_description: "Refresh token reused! Family revoked." }
    else Valid Active Refresh Token
        IdP_BE->>DB: Mark RT_V1 as revoked & replaced_by_token = RT_V2
        IdP_BE->>DB: Create new RefreshToken RT_V2 (same Family ID) + new AccessToken + new ID Token
        IdP_BE-->>App: Return { access_token: AT_NEW, refresh_token: RT_V2, id_token: ID_NEW }
    end
```

---

## 3. OIDC UserInfo & Claims Retrieval

```mermaid
sequenceDiagram
    autonumber
    actor App as Client Application
    participant IdP_BE as IdP Express Backend
    participant DB as MongoDB Database

    App->>IdP_BE: GET /api/oauth/userinfo (Header: Bearer ACCESS_TOKEN)
    IdP_BE->>IdP_BE: Verify JWT signature & expiration
    IdP_BE->>DB: Check AccessToken JTI in DB (Verify not revoked)
    IdP_BE->>DB: Fetch User details by sub (userId)
    IdP_BE->>IdP_BE: Filter profile claims according to Granted Scopes (openid, profile, email)
    IdP_BE-->>App: 200 OK { sub, name, email, email_verified, picture }
```

---

## 4. Single Logout & RP-Initiated Logout

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Client Application
    participant IdP_FE as IdP Frontend
    participant IdP_BE as IdP Backend
    participant DB as MongoDB

    User->>App: Click "Logout"
    App->>IdP_BE: GET /api/oauth/logout?id_token_hint=ID_TOKEN&post_logout_redirect_uri=https://study.onevriksh.in/logged-out
    IdP_BE->>DB: Revoke Session HTTP-Only Cookie + Active Refresh Tokens
    IdP_BE->>DB: Log Audit Event (USER_LOGOUT)
    IdP_BE-->>App: Redirect 302 to post_logout_redirect_uri
    App-->>User: Displays Logged Out Confirmation Screen
```
