import { expect, test } from "@jest/globals";
import { validateTransaction } from "../../../src/client/authorization/validate-transaction.mjs";

const config = {
  redirectUri: "https://app.example/callback",
  scopes: ["openid", "profile"],
  resource: "https://api.example",
};
const transaction = {
  state: "state-value",
  nonce: "nonce-value",
  codeVerifier: "a".repeat(43),
  redirectUri: config.redirectUri,
  scopes: config.scopes,
  resource: config.resource,
};

test("validates an OpenID Connect authorization transaction", () => {
  expect(
    validateTransaction({ code: "code-value", state: transaction.state, transaction }, config),
  ).toEqual({ code: "code-value", transaction });
});

test("validates an OAuth-only transaction without a nonce", () => {
  const oauthConfig = { ...config, scopes: ["funnel:read"] };
  const oauthTransaction = { ...transaction, nonce: undefined, scopes: oauthConfig.scopes };
  expect(
    validateTransaction(
      { code: "code-value", state: oauthTransaction.state, transaction: oauthTransaction },
      oauthConfig,
    ),
  ).toEqual({ code: "code-value", transaction: oauthTransaction });
});
