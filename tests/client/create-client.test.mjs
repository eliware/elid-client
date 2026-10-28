import { createHash } from "node:crypto";
import { expect, jest, test } from "@jest/globals";
import { createOidcKeys } from "../../test-fixtures/create-oidc-keys.mjs";
import { signIdToken } from "../../test-fixtures/sign-id-token.mjs";
import { createEliDClient } from "../../src/client/create-client.mjs";

const issuer = "https://issuer.example";
const clientId = "web-app";
const redirectUri = "https://app.example/oauth/callback";
const resource = "https://api.example/v1";
const now = Date.UTC(2026, 0, 1, 0, 0, 0);

function jsonResponse(body) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
}

test("runs discovery, PKCE login, ID Token verification, UserInfo, refresh, and revocation", async () => {
  const keys = await createOidcKeys();
  const logger = { info: jest.fn() };
  const calls = [];
  let nonce;
  let challenge;
  const metadata = {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
    revocation_endpoint: `${issuer}/revoke`,
    jwks_uri: `${issuer}/jwks`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: ["client_secret_basic"],
    resource_parameter_supported: true,
    scopes_supported: ["openid", "profile"],
  };
  const fetcher = jest.fn(async (input, options = {}) => {
    const url = new URL(input);
    calls.push({ url, options });
    if (url.pathname === "/.well-known/openid-configuration") return jsonResponse(metadata);
    if (url.pathname === "/jwks") return jsonResponse(keys.jwks);
    if (url.pathname === "/token") {
      const form = new URLSearchParams(options.body);
      if (form.get("grant_type") === "authorization_code") {
        expect(form.get("code")).toBe("authorization-code");
        expect(form.get("redirect_uri")).toBe(redirectUri);
        expect(form.get("resource")).toBe(resource);
        expect(createHash("sha256").update(form.get("code_verifier")).digest("base64url")).toBe(
          challenge,
        );
        return jsonResponse({
          access_token: "opaque-access-token",
          refresh_token: "refresh-token-1",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "openid profile",
          id_token: await signIdToken(
            keys.privateKey,
            { nonce, iat: now / 1000, exp: now / 1000 + 3600 },
            {
              issuer,
              audience: clientId,
              subject: "user-1",
              issuedAt: now / 1000,
              expiresAt: now / 1000 + 3600,
            },
          ),
        });
      }
      expect(form.get("grant_type")).toBe("refresh_token");
      expect(form.get("refresh_token")).toBe("refresh-token-1");
      expect(form.get("resource")).toBe(resource);
      return jsonResponse({
        access_token: "opaque-access-token-2",
        refresh_token: "refresh-token-2",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile",
        id_token: await signIdToken(
          keys.privateKey,
          { iat: now / 1000, exp: now / 1000 + 3600 },
          {
            issuer,
            audience: clientId,
            subject: "user-1",
            issuedAt: now / 1000,
            expiresAt: now / 1000 + 3600,
          },
        ),
      });
    }
    if (url.pathname === "/userinfo") {
      expect(options.headers.authorization).toBe("Bearer opaque-access-token");
      return jsonResponse({ sub: "user-1", preferred_username: "eli" });
    }
    if (url.pathname === "/revoke") return new Response(null, { status: 200 });
    throw new Error("Unexpected test endpoint.");
  });
  const client = createEliDClient({
    issuer,
    clientId,
    clientSecret: "client-secret",
    redirectUri,
    scopes: ["openid", "profile"],
    resource,
    fetch: fetcher,
    now: () => now,
    logger,
  });

  const discovered = await client.discover();
  expect(discovered.issuer).toBe(issuer);
  const request = await client.createAuthorizationRequest();
  const authorizeUrl = new URL(request.authorizationUrl);
  nonce = request.transaction.nonce;
  challenge = authorizeUrl.searchParams.get("code_challenge");
  expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("S256");
  expect(authorizeUrl.searchParams.get("resource")).toBe(resource);

  const tokens = await client.exchangeAuthorizationCode({
    code: "authorization-code",
    state: request.transaction.state,
    transaction: request.transaction,
  });
  expect(tokens).toMatchObject({
    accessToken: "opaque-access-token",
    refreshToken: "refresh-token-1",
    identity: { issuer, subject: "user-1" },
  });
  expect(tokens.idTokenClaims.nonce).toBe(nonce);
  await expect(client.getUserInfo(tokens.accessToken, tokens.identity.subject)).resolves.toEqual({
    sub: "user-1",
    preferred_username: "eli",
  });
  await expect(
    client.refreshTokens({ refreshToken: tokens.refreshToken, nonce, identity: tokens.identity }),
  ).resolves.toMatchObject({ identity: tokens.identity });
  await expect(client.revokeToken("refresh-token-2", "refresh_token")).resolves.toBeUndefined();
  expect(
    calls.filter((call) => call.url.pathname === "/.well-known/openid-configuration"),
  ).toHaveLength(1);
  expect(client.introspect).toBeUndefined();
  expect(JSON.stringify(logger.info.mock.calls)).not.toMatch(
    /client-secret|authorization-code|opaque-access-token|refresh-token|nonce/,
  );
});

test("rejects state mismatch before sending a token request", async () => {
  const fetcher = jest.fn();
  const client = createEliDClient({
    issuer,
    clientId,
    redirectUri,
    scopes: ["openid"],
    fetch: fetcher,
    logger: { info: () => {} },
  });
  const transaction = {
    state: "saved-state",
    nonce: "saved-nonce",
    codeVerifier: "a".repeat(43),
    redirectUri,
    scopes: ["openid"],
  };
  await expect(
    client.exchangeAuthorizationCode({ code: "code", state: "other", transaction }),
  ).rejects.toMatchObject({
    code: "state_mismatch",
  });
  await expect(client.exchangeAuthorizationCode()).rejects.toMatchObject({
    code: "invalid_transaction",
  });
  await expect(client.refreshTokens()).rejects.toMatchObject({ code: "invalid_argument" });
  await expect(client.refreshTokens({ refreshToken: "refresh" })).rejects.toMatchObject({
    code: "invalid_argument",
  });
  expect(fetcher).not.toHaveBeenCalled();
});

test("exchanges OAuth-only codes without a nonce or ID Token", async () => {
  const calls = [];
  const metadata = {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    jwks_uri: `${issuer}/jwks`,
    code_challenge_methods_supported: ["S256"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["funnel:read"],
  };
  const fetcher = async (input) => {
    const url = new URL(input);
    calls.push(url);
    if (url.pathname.endsWith("openid-configuration")) return jsonResponse(metadata);
    return jsonResponse({
      access_token: "opaque-api-token",
      token_type: "Bearer",
      expires_in: 600,
      scope: "funnel:read",
    });
  };
  const client = createEliDClient({
    issuer,
    clientId,
    redirectUri,
    scopes: ["funnel:read"],
    fetch: fetcher,
    logger: { info: () => {} },
  });
  const request = await client.createAuthorizationRequest();
  expect(request.transaction.nonce).toBeUndefined();
  expect(new URL(request.authorizationUrl).searchParams.has("nonce")).toBe(false);
  const tokens = await client.exchangeAuthorizationCode({
    code: "api-code",
    state: request.transaction.state,
    transaction: request.transaction,
  });
  expect(tokens).toEqual({
    accessToken: "opaque-api-token",
    refreshToken: undefined,
    tokenType: "Bearer",
    expiresIn: 600,
    scope: "funnel:read",
  });
  await expect(client.getUserInfo(tokens.accessToken, "user-1")).rejects.toMatchObject({
    code: "unsupported_provider",
  });
  await expect(client.refreshTokens({ refreshToken: "api-refresh" })).resolves.toMatchObject({
    accessToken: "opaque-api-token",
  });
  expect(calls.filter((url) => url.pathname === "/token")).toHaveLength(2);
});

test.each([
  [
    "authorization code",
    { access_token: "access", token_type: "Bearer" },
    async (client) => {
      const request = await client.createAuthorizationRequest();
      return client.exchangeAuthorizationCode({
        code: "code",
        state: request.transaction.state,
        transaction: request.transaction,
      });
    },
    "invalid_token_response",
  ],
  [
    "refresh",
    { access_token: "access-next", token_type: "Bearer" },
    (client) =>
      client.refreshTokens({
        refreshToken: "refresh-current",
        nonce: "saved-nonce",
        identity: { issuer, subject: "user-1" },
      }),
    undefined,
  ],
])("handles %s responses without an ID Token", async (_flow, tokenResponse, invoke, errorCode) => {
  const metadata = {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    jwks_uri: `${issuer}/jwks`,
    code_challenge_methods_supported: ["S256"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: ["none"],
  };
  const fetcher = async (input) => {
    if (new URL(input).pathname.endsWith("openid-configuration")) return jsonResponse(metadata);
    return jsonResponse(tokenResponse);
  };
  const client = createEliDClient({
    issuer,
    clientId,
    redirectUri,
    scopes: ["openid"],
    fetch: fetcher,
    logger: { info: () => {} },
  });
  const result = invoke(client);
  if (errorCode) {
    await expect(result).rejects.toMatchObject({ code: errorCode });
  } else {
    await expect(result).resolves.toMatchObject({
      accessToken: "access-next",
      refreshToken: "refresh-current",
      tokenType: "Bearer",
      identity: { issuer, subject: "user-1" },
    });
  }
});

test("rejects an empty client configuration", () => {
  expect(() => createEliDClient()).toThrow(/issuer must be an absolute URL/);
});
