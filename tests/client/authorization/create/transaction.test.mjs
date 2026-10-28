import { expect, test } from "@jest/globals";
import { createAuthorizationTransaction } from "../../../../src/client/authorization/create/transaction.mjs";

test("creates unique transaction values and copies client settings", () => {
  const config = {
    redirectUri: "https://app.example/callback",
    scopes: ["openid", "profile"],
    resource: "https://api.example",
  };
  const transaction = createAuthorizationTransaction(config);
  const next = createAuthorizationTransaction(config);
  expect(transaction).toMatchObject({
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    resource: config.resource,
  });
  for (const key of ["state", "nonce", "codeVerifier"]) {
    expect(transaction[key]).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(transaction[key]).not.toBe(next[key]);
  }
  expect(transaction.scopes).not.toBe(config.scopes);
});
test("keeps an omitted resource undefined", () => {
  expect(
    createAuthorizationTransaction({
      redirectUri: "https://app.example/callback",
      scopes: ["openid"],
    }),
  ).toMatchObject({ resource: undefined });
});

test("does not create a nonce for OAuth-only transactions", () => {
  const transaction = createAuthorizationTransaction({
    redirectUri: "https://app.example/callback",
    scopes: ["funnel:read"],
  });
  expect(transaction.nonce).toBeUndefined();
});
