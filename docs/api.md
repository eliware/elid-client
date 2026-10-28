# API reference

The package exports `createEliDClient` and `ElidClientError` from its root. The client supports Node.js server-side OAuth and OpenID Connect flows.

## Create a client

```js
import { createEliDClient } from "@eliware/elid-client";

const client = createEliDClient({
  issuer: "https://login.example.com",
  clientId: "example-web",
  clientSecret: process.env.ELID_CLIENT_SECRET,
  redirectUri: "https://app.example.com/oauth/callback",
  scopes: ["openid", "profile"],
  resource: "https://api.example.com/",
});
```

| Option                  | Required | Description                                                                                |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `issuer`                | Yes      | The exact issuer URL from EliD discovery.                                                  |
| `clientId`              | Yes      | The client ID registered for this application.                                             |
| `clientSecret`          | No       | The secret for a confidential client.                                                      |
| `redirectUri`           | Yes      | The exact registered HTTPS callback URI without a query or fragment.                       |
| `scopes`                | Yes      | Unique OAuth scope values. Include `openid` for user sign-in.                              |
| `resource`              | No       | The API resource identifier. EliD must advertise resource indicator support.               |
| `timeoutMs`             | No       | The request timeout in milliseconds. The default is `5000`.                                |
| `metadataCacheMs`       | No       | The issuer metadata cache period in milliseconds. The default is `300000`.                 |
| `clockToleranceSeconds` | No       | The allowed ID Token clock difference. The default is `5`.                                 |
| `maxIdTokenAgeSeconds`  | No       | The maximum age of an ID Token. The default is `86400` seconds.                            |
| `fetch`                 | No       | A replacement Fetch function for controlled transports. The default is `globalThis.fetch`. |
| `now`                   | No       | A clock that returns milliseconds since the Unix epoch. The default is `Date.now`.         |
| `logger`                | No       | A logger with an `info` method. The default is `@eliware/log`.                             |

The issuer and protocol endpoints must use HTTPS. The library permits HTTP issuer URLs on loopback hosts for local development. The callback URI must use HTTPS.

## Load issuer metadata

```js
const metadata = await client.discover();
console.log(metadata.issuer);
```

The client loads OpenID Connect discovery metadata from the configured issuer. It rejects an issuer mismatch, unsafe endpoint URL, or missing PKCE S256 support. It caches validated metadata and uses the advertised endpoints.

The client verifies ID Tokens with issuer JWKS. The JOSE verifier caches signing keys and refreshes them when the issuer changes signing keys.

## Start authorization

```js
const { authorizationUrl, transaction } = await client.createAuthorizationRequest();
await sessionStore.save(sessionId, transaction);
return redirect(authorizationUrl);
```

The method creates random `state` and PKCE verifier values. When scopes include `openid`, it also creates a nonce. It returns the verifier in `transaction` so the application can store it server-side. Do not send the transaction to browser JavaScript or browser storage.

Store each transaction once in the application session store. Consume and delete it when the callback arrives. This library does not provide session storage or callback routes.

## Send the authorization code

```js
const transaction = await sessionStore.consume(sessionId);
const tokens = await client.exchangeAuthorizationCode({
  code: request.query.code,
  state: request.query.state,
  transaction,
});
```

The client checks the returned state and the saved transaction before it sends the code. It sends the same redirect URI, PKCE verifier, and resource value. When scopes include `openid`, it requires and verifies an ID Token. It checks the signature, issuer, audience, `azp` claim, expiration, issue time, and nonce. It rejects ID Tokens older than `maxIdTokenAgeSeconds`.

When scopes omit `openid`, the request omits the OIDC nonce. The client accepts a token response without an ID Token and returns no ID Token or identity fields. Use OAuth-only scopes for API access without user sign-in.

An OpenID Connect result includes the bearer access token, optional refresh token, ID Token claims, and stable identity pair:

```js
tokens.identity; // { issuer, subject }
```

Do not decode access tokens to identify users or infer audiences. Use the ID Token for sign-in claims. Use application policy to authorize users.

## Read UserInfo

```js
const claims = await client.getUserInfo(tokens.accessToken, tokens.identity.subject);
```

The method sends the access token to the discovered UserInfo endpoint. It checks that the returned `sub` matches the verified ID Token subject. UserInfo requires the `openid` scope.

## Refresh and revoke tokens

```js
const nextTokens = await client.refreshTokens({
  refreshToken: tokens.refreshToken,
  nonce: tokens.idTokenClaims.nonce,
});

await client.revokeToken(nextTokens.refreshToken, "refresh_token");
```

The refresh method repeats the configured resource value. Use a replacement refresh token when EliD returns one. Keep the submitted refresh token when the response omits a replacement.

For OpenID Connect clients, pass the initial authentication nonce. A refreshed ID Token can omit `nonce`. If it contains `nonce`, the client requires a match with the initial value. The client verifies its signature and claims.

OAuth-only clients can refresh without a nonce.

The response may omit an ID Token. Keep the prior verified identity in the application session when it does. Save token updates atomically. EliD may replace refresh tokens and reject replay.

The revoke method uses the discovered `revocation_endpoint`. The optional hint accepts `access_token` or `refresh_token`. The client does not provide token introspection because resource servers own that operation.

## Errors

The client throws `ElidClientError` with a stable `code` and a safe message. It may include an HTTP `status` or an OAuth `oauthCode`. It does not include response descriptions or credentials.

Process errors at the application boundary. Do not log authorization codes, tokens, client secrets, transaction verifiers, or user input.
