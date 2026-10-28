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

Add the exact callback URI to the EliD registration. Use an HTTPS callback in deployed applications. Use a client secret only when EliD registered the application as a confidential client. The library chooses a supported client authentication method from issuer metadata.

```js
import { createEliDClient } from "@eliware/elid-client";

const client = createEliDClient({
  issuer: process.env.ELID_ISSUER_URL,
  clientId: process.env.ELID_CLIENT_ID,
  clientSecret: process.env.ELID_CLIENT_SECRET,
  redirectUri: process.env.ELID_REDIRECT_URI,
  scopes: process.env.ELID_SCOPES.trim().split(/\s+/),
  resource: process.env.ELID_RESOURCE || undefined,
});
```

For a public client, omit `clientSecret`. Use an HTTPS issuer and redirect URI in deployed applications. The client permits an HTTP issuer on loopback for local use.

Include `openid` in the scopes for user sign-in. Omit `openid` for API access without user sign-in. OAuth-only transactions do not contain a nonce, and their token results do not contain ID Token or identity fields.

Set `ELID_SCOPES` to one or more space-separated scopes. Do not include an empty value. Set `ELID_RESOURCE` only when the API needs a resource indicator and EliD advertises support for it. The issuer must support Authorization Code and PKCE S256.

| Environment variable  | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `ELID_ISSUER_URL`     | The exact issuer URL configured for EliD discovery.       |
| `ELID_CLIENT_ID`      | The client ID registered for this application.            |
| `ELID_CLIENT_SECRET`  | Optional secret for a confidential client.                |
| `ELID_REDIRECT_URI`   | The exact callback URI registered with EliD.              |
| `ELID_SCOPES`         | A space-separated list of unique OAuth scopes.            |
| `ELID_RESOURCE`       | Optional resource identifier for an audience-bound token. |
| `NODE_EXTRA_CA_CERTS` | Optional path to a trusted CA file for local testing.     |

## Start a server-side sign-in

Call `createAuthorizationRequest()` before redirecting the user. Store the returned transaction in the application session store on the server. Do not store it in browser JavaScript or browser storage.

When the callback arrives, atomically consume the saved transaction. Pass its state and the returned code to `exchangeAuthorizationCode()`. Process an authorization denial as an `ElidClientError` with the `authorization_error` code. Keep session creation, cookie policy, CSRF protection, and application routes in the consuming application.

This framework-neutral example shows the application responsibilities:

```js
const { authorizationUrl, transaction } = await client.createAuthorizationRequest();
await transactionStore.saveOnce(sessionId, transaction);
return redirect(authorizationUrl);
```

In the callback route, load and delete the transaction before exchanging the code:

```js
const transaction = await transactionStore.consumeOnce(sessionId);
const tokens = await client.exchangeAuthorizationCode({
  code: request.query.code,
  state: request.query.state,
  error: request.query.error,
  transaction,
});

await applicationSessionStore.save(sessionId, {
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  identity: tokens.identity,
  idTokenClaims: tokens.idTokenClaims,
  oidcNonce: transaction.nonce,
});
```

Use your framework's response and session APIs for the example functions. Store the transaction in server-side session state. Do not accept a transaction from the callback request.

For OpenID Connect, call `getUserInfo()` with the bearer access token and the subject from the verified ID Token when the issuer advertises a UserInfo endpoint. Keep the initial authentication nonce in server-side session state if you will refresh tokens. Pass it to `refreshTokens()` when the client uses the `openid` scope. A refreshed ID Token can omit `nonce`. If it contains `nonce`, the client checks that it matches the initial value.

Pass the saved `identity` to `refreshTokens()` too. The refreshed result keeps it when EliD omits an ID Token. The client replaces it with the newly verified identity when EliD returns an ID Token.

OAuth-only clients can refresh without a nonce. Save replacement tokens atomically. The refresh result can omit an ID Token. Keep the prior verified identity when that happens. Call `revokeToken()` when the application ends its session or stops using a token.

Token responses include a bearer `accessToken`. They can include a `refreshToken`, `expiresIn`, and granted `scope`. OpenID Connect responses can also include `idToken`, `idTokenClaims`, and `identity`. Each of these fields is optional. The application must define how it stores tokens and responds when a token expires or refresh fails.

## Run the discovery example

Set `ELID_ISSUER_URL`, `ELID_CLIENT_ID`, `ELID_REDIRECT_URI`, and `ELID_SCOPES` in the process environment. Set `NODE_EXTRA_CA_CERTS` when the local issuer uses a private test CA.

Optionally set `ELID_CLIENT_SECRET` for a confidential client. Set `ELID_RESOURCE` when the issuer requires an audience-bound token.

Run the example from the application directory:

```sh
node node_modules/@eliware/elid-client/examples/discover.mjs
```

The example prints validated issuer and endpoint URLs. It does not print client secrets, tokens, or transaction values.
