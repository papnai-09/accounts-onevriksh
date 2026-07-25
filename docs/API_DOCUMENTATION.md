# OneVriksh Accounts - Enterprise OAuth 2.1 & OpenID Connect API Documentation

Base URL: `https://accounts.onevriksh.in` (Local Dev: `http://localhost:5000`)

---

## 1. OIDC Discovery & Public Keys

### 1.1 OIDC Discovery Configuration Endpoint
Returns OpenID Connect provider configuration metadata.

- **Method**: `GET`
- **Path**: `/.well-known/openid-configuration`
- **Headers**: None
- **Response**: `200 OK`
```json
{
  "issuer": "https://accounts.onevriksh.in",
  "authorization_endpoint": "https://accounts.onevriksh.in/api/oauth/authorize",
  "token_endpoint": "https://accounts.onevriksh.in/api/oauth/token",
  "userinfo_endpoint": "https://accounts.onevriksh.in/api/oauth/userinfo",
  "jwks_uri": "https://accounts.onevriksh.in/.well-known/jwks.json",
  "revocation_endpoint": "https://accounts.onevriksh.in/api/oauth/revoke",
  "introspection_endpoint": "https://accounts.onevriksh.in/api/oauth/introspect",
  "end_session_endpoint": "https://accounts.onevriksh.in/api/oauth/logout",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "offline_access"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post", "none"],
  "claims_supported": ["iss", "sub", "aud", "exp", "iat", "auth_time", "nonce", "email", "email_verified", "name", "given_name", "family_name", "picture"],
  "code_challenge_methods_supported": ["S256"]
}
```

---

### 1.2 JWKS (JSON Web Key Set) Endpoint
Exposes public RSA signing keys used to verify OIDC ID Tokens.

- **Method**: `GET`
- **Path**: `/.well-known/jwks.json` or `/api/oauth/jwks`
- **Headers**: None
- **Response**: `200 OK`
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "onevriksh-rs256-key-1",
      "n": "u1v2w3...",
      "e": "AQAB"
    }
  ]
}
```

---

## 2. OAuth 2.1 & OpenID Connect Core Endpoints

### 2.1 Authorization Endpoint
Initiates the OAuth 2.1 PKCE authorization flow.

- **Method**: `GET` or `POST`
- **Path**: `/api/oauth/authorize`
- **Query Parameters / Body**:
  - `client_id` (string, required): Registered Client ID.
  - `redirect_uri` (string, required): Allowed redirect URI.
  - `response_type` (string, required): Must be `code`.
  - `scope` (string, required): Space-separated list of scopes (`openid profile email offline_access`).
  - `state` (string, required): CSRF prevention state parameter.
  - `code_challenge` (string, required): Base64URL encoded SHA-256 code challenge.
  - `code_challenge_method` (string, required): Must be `S256`.
  - `nonce` (string, optional): Replay attack mitigation nonce for OIDC ID Token.
- **Responses**:
  - `302 Redirect` to `https://accounts.onevriksh.in/login?return_to=...` (If user unauthenticated).
  - `200 OK` JSON `{ consent_required: true, client: {...}, scopes: [...] }` (If user authenticated but consent needed).
  - `302 Redirect` to `{redirect_uri}?code={authorization_code}&state={state}` (Upon consent/approval).
- **Error Response** (`302 Redirect` to `{redirect_uri}?error=invalid_request&state={state}` or `400 Bad Request`):
```json
{
  "error": "invalid_request",
  "error_description": "PKCE code_challenge and code_challenge_method=S256 are required"
}
```

---

### 2.2 Token Endpoint
Exchanges authorization code for Access Token, ID Token, and Refresh Token, OR rotates a Refresh Token.

- **Method**: `POST`
- **Path**: `/api/oauth/token`
- **Headers**: `Content-Type: application/x-www-form-urlencoded` or `application/json`
- **Parameters (Authorization Code Grant)**:
  - `grant_type`: `"authorization_code"`
  - `client_id`: string
  - `client_secret`: string (if confidential client)
  - `code`: string (Authorization code received from authorize endpoint)
  - `redirect_uri`: string
  - `code_verifier`: string (Plaintext PKCE code verifier matching S256 code_challenge)
- **Parameters (Refresh Token Grant)**:
  - `grant_type`: `"refresh_token"`
  - `client_id`: string
  - `client_secret`: string (if confidential client)
  - `refresh_token`: string
- **Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rft_8941a...",
  "id_token": "eyJhbGciOi...",
  "scope": "openid profile email offline_access"
}
```
- **Error Response**: `400 Bad Request`
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid or expired authorization code"
}
```

---

### 2.3 UserInfo Endpoint
Returns claims about the authenticated user based on granted scopes.

- **Method**: `GET` or `POST`
- **Path**: `/api/oauth/userinfo`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`
```json
{
  "sub": "65b2f1809a7123",
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "email": "jane@onevriksh.in",
  "email_verified": true,
  "picture": "https://accounts.onevriksh.in/avatars/jane.jpg",
  "updated_at": 1774464000
}
```
- **Error Response**: `401 Unauthorized`
```json
{
  "error": "invalid_token",
  "error_description": "The access token is expired or invalid"
}
```

---

### 2.4 Token Revocation Endpoint (RFC 7009)
Revokes an Access Token or Refresh Token.

- **Method**: `POST`
- **Path**: `/api/oauth/revoke`
- **Headers**: `Content-Type: application/x-www-form-urlencoded` or `application/json`
- **Body**:
  - `token` (string, required): Token to revoke.
  - `token_type_hint` (string, optional): `"access_token"` or `"refresh_token"`.
  - `client_id` (string, required)
  - `client_secret` (string, optional)
- **Response**: `200 OK`
```json
{
  "status": "revoked"
}
```

---

### 2.5 Token Introspection Endpoint (RFC 7662)
Introspects an active Access Token or Refresh Token to determine its active status and metadata.

- **Method**: `POST`
- **Path**: `/api/oauth/introspect`
- **Headers**: `Authorization: Basic <base64(client_id:client_secret)>` or Body client authentication
- **Body**:
  - `token` (string, required)
  - `token_type_hint` (string, optional)
- **Response**: `200 OK`
```json
{
  "active": true,
  "scope": "openid profile email",
  "client_id": "client_study_847129",
  "sub": "65b2f1809a7123",
  "exp": 1774467600,
  "iat": 1774464000,
  "token_type": "Bearer"
}
```

---

### 2.6 RP-Initiated & SSO Logout Endpoint
Terminates the user's session on the IdP and redirects back to the relying party.

- **Method**: `GET` or `POST`
- **Path**: `/api/oauth/logout`
- **Query Parameters / Body**:
  - `id_token_hint` (string, optional): Previously issued ID Token.
  - `post_logout_redirect_uri` (string, optional): URI to redirect to after logout.
  - `state` (string, optional)
- **Response**: `302 Redirect` to `post_logout_redirect_uri?state=...` or `200 OK` JSON `{ message: "Logged out successfully" }`.

---

## 3. Session & Client Management Endpoints

### 3.1 Active Sessions List
- **Method**: `GET`
- **Path**: `/api/sessions`
- **Headers**: Cookie `onevriksh_session` or `Authorization: Bearer <access_token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "sessions": [
    {
      "id": "65c3a2...",
      "browser": "Chrome 122.0",
      "os": "Windows 11",
      "deviceName": "Desktop PC",
      "ipAddress": "203.0.113.195",
      "country": "India",
      "isCurrent": true,
      "lastActivity": "2026-07-25T19:30:00Z"
    }
  ]
}
```

### 3.2 Terminate Session
- **Method**: `DELETE`
- **Path**: `/api/sessions/:sessionId`
- **Response**: `200 OK` `{ "success": true, "message": "Session terminated" }`

### 3.3 OAuth Client Admin Management
- `GET /api/clients`: List all registered OAuth applications.
- `POST /api/clients`: Create a new OAuth application.
- `PUT /api/clients/:id`: Update client settings.
- `DELETE /api/clients/:id`: Revoke/delete application.
- `POST /api/clients/:id/rotate-secret`: Generate new client secret.
