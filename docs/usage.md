# Usage

Install `@eliware/elid-client` in a Node.js 26 or later server application. The package supports OAuth and OpenID Connect client operations for server-rendered applications and backends for frontend applications.

## Install the package

Run this command in the consuming application:

```sh
npm install @eliware/elid-client
```

Import the public API from `@eliware/elid-client`. The package uses native ESM and exposes TypeScript declarations.

## Configure a client

Create a separate EliD client registration for each application. Store confidential client secrets in the application's approved secret store. Set the issuer, client ID, exact redirect URI, scopes, and optional resource through application runtime configuration.

```js
import { createEliDClient } from "@eliware/elid-client";

const client = createEliDClient({
  issuer: process.env.ELID_ISSUER_URL,
  clientId: process.env.ELID_CLIENT_ID,
  clientSecret: process.env.ELID_CLIENT_SECRET,
  redirectUri: process.env.ELID_REDIRECT_URI,
  scopes: process.env.ELID_SCOPES.split(" "),
  resource: process.env.ELID_RESOURCE || undefined,
});
```

For a public client, omit `clientSecret`. Use an HTTPS issuer and redirect URI in deployed applications. The client permits an HTTP issuer on loopback for local development.

Include `openid` in the scopes for user sign-in. Omit `openid` for API access without user sign-in. OAuth-only transactions do not contain a nonce, and their token results do not contain ID Token or identity fields.

## Start a server-side sign-in

Call `createAuthorizationRequest()` before redirecting the user. Store the returned transaction in the application session store on the server. Do not store it in browser JavaScript or browser storage.

When the callback arrives, atomically consume the saved transaction. Pass its state and the returned code to `exchangeAuthorizationCode()`. Keep session creation, cookie policy, CSRF protection, and application routes in the consuming application.

For OpenID Connect, call `getUserInfo()` with the bearer access token and the subject from the verified ID Token. Pass the initial authentication nonce to `refreshTokens()` when the client uses the `openid` scope. A refreshed ID Token can omit `nonce`. If it contains `nonce`, the client checks that it matches the initial value.

OAuth-only clients can refresh without a nonce. Save replacement tokens atomically. Call `revokeToken()` when the application ends its session or stops using a token.

## Run the discovery example

Set `ELID_ISSUER_URL`, `ELID_CLIENT_ID`, `ELID_REDIRECT_URI`, and `ELID_SCOPES` in the process environment. Set `NODE_EXTRA_CA_CERTS` when the local issuer uses a private test CA.

Optionally set `ELID_CLIENT_SECRET` for a confidential client. Set `ELID_RESOURCE` when the issuer requires an audience-bound token.

Run this command from the repository root:

```sh
node examples/discover.mjs
```

The example prints validated issuer and endpoint URLs. It does not print client secrets, tokens, or transaction values.

## Validate a checkout

Run these commands from the repository root:

```sh
npm ci
npm test
npm run typecheck
npm run pack
```

The test suite uses mocked provider responses. It does not contact a production issuer. Run `node test-fixtures/verify-local-smoke.mjs` with the local smoke environment to test EliD.

## Package contents and releases

The npm package includes `src/`, `docs/`, `examples/`, `specs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, and `package.json`. It excludes tests, test fixtures, local environment files, and build output.

Use `package.json.version` as the version source. Match each release tag to `vMAJOR.MINOR.PATCH`. Run `npm run pack` before release consideration. Publish only through the approved Operations release handoff with npm provenance.
