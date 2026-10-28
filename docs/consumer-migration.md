# Consumer OAuth inventory and migration

This document summarizes repository source and declared defaults. Deployment values stay with each owning application.

## docs-web

- **Role:** OpenID Connect client and server-side web app. It does not validate incoming EliD tokens as a resource server.
- **Configuration:** `OIDC_ISSUER`, `OIDC_INTERNAL_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_REDIRECT_URI`, `OIDC_CLIENT_SECRET`, and `OIDC_RESOURCE`.
- **Flow:** Requests `openid profile email groups docs:read` and uses a resource value from configuration or the issuer root.
- **Session and tokens:** An encrypted, HTTP-only cookie stores PKCE state, verifier, and token response. The callback sends authorization codes directly. The app does not call UserInfo, refresh, revoke, or introspection.
- **Migration:** Move discovery, request creation, authorization code grant, and ID Token checks to this library. Keep its encrypted session cookie, routes, protected paths, and access policy in docs-web. Add refresh and logout revocation behavior with app-owned session updates.

Use docs-web as the first migration. It has a focused server-side OAuth module and no separate introspection role. The package must be available before the consumer can install it.

## checkd

- **Role:** OpenID Connect client and HTTP API resource server. It has no declared MCP server role.
- **Configuration:** `ELID_ISSUER`, `ELID_INTERNAL_ISSUER`, `ELID_CLIENT_ID`, `ELID_REDIRECT_URI`, and `ELID_RESOURCE`.
- **Flow:** Requests `openid profile email groups`. Its resource default is the Checkd domain.
- **Session and tokens:** An encrypted, HTTP-only cookie stores session tokens and callback transaction. The middleware introspects access tokens and refreshes tokens.
- **Migration:** Use this library for discovery, authorization, authorization code grant, ID Token checks, refresh, and revocation. Keep HTTP token introspection in a separate resource-server component until the app changes its request authorization policy.

Checkd has a separate introspection requirement. Its middleware checks incoming API and WebSocket bearer tokens. Do not move that check into this client library.

## funnel

- **Role:** OpenID Connect client, MCP client, and MCP protected resource server.
- **Configuration:** `ELID_ISSUER`, `ELID_INTERNAL_ISSUER`, `ELID_CLIENT_ID`, `ELID_REDIRECT_URI`, and the Funnel MCP resource.
- **Flow:** Requests `funnel:read funnel:write` for `https://funnel.purinton.us/mcp`. The chat app sends that access token to its MCP tool.
- **Session and tokens:** An encrypted, HTTP-only cookie stores tokens and callback state. The middleware introspects access tokens and refreshes them. The MCP route separately checks bearer access and required scopes.
- **Migration:** Use this library for the EliD client flow. Keep MCP protected-resource checks in `mcp-auth.mjs` or `@eliware/mcp-server`. Keep introspection separate if the web session requires an active-token check.

Funnel has a separate introspection requirement in its web middleware. Its MCP endpoint also has a protected-resource role. Keep the two boundaries distinct.

## Mail web frontend

- **Role:** The Mail frontend uses an OAuth client flow. Issue #9 reports that the public `mail-web` repository is empty.
- **Source:** The active source repository, code owner, and migration target remain unknown. Do not start Mail migration until its owner identifies them.
- **Configuration:** Confirm the issuer, client ID, callback URI, scopes, and resource from the active source and deployment configuration.
- **Session and tokens:** Confirm token storage and session handling from the active source. Keep both responsibilities in the Mail frontend application.
- **Migration:** Add the source repository after Mail's owner identifies it. Migrate its OAuth flow after the owner confirms the source and deployment configuration.

Do not classify `mail-server` as the frontend OAuth client unless its source confirms that role.

## mail-server API

- **Role:** The reviewed source shows an HTTP API resource server for mail clients. It does not show an EliD OpenID Connect client or an MCP role.
- **Configuration:** The web API uses `MAIL_WEB_API_TOKEN`. The reviewed server code has no EliD issuer, redirect URI, scope, or resource configuration.
- **Session and tokens:** The server validates its own web API token. It does not request or manage EliD tokens.
- **Migration:** Keep this client library out of the mail API. Document its OAuth frontend separately under Mail web frontend.

## sangah-landing

- **Role:** The examined repository has no active EliD OAuth or OpenID Connect flow and no current introspection use.
- **Configuration:** No EliD issuer, client, redirect, scope, or resource configuration appears in the examined source.
- **Session and tokens:** The planned requests operator panel currently does not use EliD sign-in.
- **Migration:** Examine the owning repository when the panel adopts EliD. Keep user provisioning, roles, routes, and session policy in that application. Set its client, redirect URI, scopes, and resource from deployment configuration.

## Migration order

1. Identify the Mail frontend source repository, code owner, and deployment configuration. This step blocks Mail migration until its owner supplies the source location.
2. Migrate the Mail frontend OAuth flow after its owner provides the source and deployment configuration.
3. Migrate docs-web after version `15.0.1` is available to consumers.
4. Migrate Checkd's client flow and keep its separate resource-server introspection.
5. Migrate Funnel's client flow and preserve its MCP resource checks and separate web-session introspection.
6. Reassess the Sangah operator panel when its repository and OAuth requirements are settled.

Exclude the Mail API from OAuth client migration unless its source confirms that role.

The client package does not provide token introspection. Checkd and Funnel require that behavior outside the client package because they inspect incoming tokens.
