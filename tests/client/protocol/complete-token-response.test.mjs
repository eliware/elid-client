import { expect, jest, test } from "@jest/globals";
import { createTokenResponseCompleter } from "../../../src/client/protocol/complete-token-response.mjs";

const response = { access_token: "access", token_type: "Bearer" };
const claims = { iss: "https://issuer.example", sub: "user-1", nonce: "nonce" };

test("returns OAuth tokens without OpenID Connect fields", async () => {
  const complete = createTokenResponseCompleter({ scopes: ["api:read"] }, jest.fn());
  await expect(
    complete({ ...response, id_token: "unexpected-id-token" }, undefined, {}, false, false),
  ).resolves.toEqual({
    accessToken: "access",
    refreshToken: undefined,
    tokenType: "Bearer",
    expiresIn: undefined,
    scope: undefined,
  });
});

test("requires ID Tokens for OpenID Connect code exchanges", async () => {
  const complete = createTokenResponseCompleter({ scopes: ["openid"] }, jest.fn());
  await expect(complete(response, "nonce", {}, true, false)).rejects.toMatchObject({
    code: "invalid_token_response",
  });
  await expect(complete(response, "nonce", {}, false, true)).resolves.toMatchObject({
    accessToken: "access",
  });
});

test("preserves the prior identity when a refresh response omits an ID Token", async () => {
  const priorIdentity = { issuer: claims.iss, subject: claims.sub };
  const complete = createTokenResponseCompleter({ scopes: ["openid"] }, jest.fn());
  await expect(complete(response, "nonce", {}, false, true, priorIdentity)).resolves.toMatchObject({
    identity: priorIdentity,
  });
});

test("verifies returned ID Tokens and builds identity fields", async () => {
  const verifyClaims = jest.fn(async () => claims);
  const complete = createTokenResponseCompleter({ scopes: ["openid"] }, verifyClaims);
  const tokens = await complete(
    { ...response, id_token: "signed-id-token" },
    "nonce",
    { issuer: claims.iss },
    false,
    true,
  );
  expect(tokens).toMatchObject({
    idTokenClaims: claims,
    identity: { issuer: claims.iss, subject: claims.sub },
  });
  expect(verifyClaims).toHaveBeenCalledWith(
    "signed-id-token",
    "nonce",
    { issuer: claims.iss },
    true,
  );
});
