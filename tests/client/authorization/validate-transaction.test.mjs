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

test("validates state, code, and saved transaction", () => {
  expect(
    validateTransaction({ code: "code-value", state: transaction.state, transaction }, config),
  ).toEqual({
    code: "code-value",
    transaction,
  });
});

test("validates OAuth-only transactions without a nonce", () => {
  const oauthConfig = { ...config, scopes: ["funnel:read"] };
  const oauthTransaction = { ...transaction, nonce: undefined, scopes: oauthConfig.scopes };
  expect(
    validateTransaction(
      { code: "code-value", state: oauthTransaction.state, transaction: oauthTransaction },
      oauthConfig,
    ),
  ).toEqual({ code: "code-value", transaction: oauthTransaction });
});

test.each([
  [{ code: "code", state: "wrong", transaction }, "state_mismatch"],
  [{ code: "code", state: "", transaction }, "state_mismatch"],
  [
    { code: "code", state: transaction.state, error: "access_denied", transaction },
    "authorization_error",
  ],
  [{ code: "code", state: transaction.state, error: 7, transaction }, "authorization_error"],
  [{ code: "", state: transaction.state, transaction }, "invalid_argument"],
  [{ code: "code", state: transaction.state, transaction: null }, "invalid_transaction"],
  [
    { code: "code", state: transaction.state, transaction: { ...transaction, nonce: "" } },
    "invalid_transaction",
  ],
  [
    {
      code: "code",
      state: transaction.state,
      transaction: { ...transaction, codeVerifier: "short" },
    },
    "invalid_transaction",
  ],
  [
    {
      code: "code",
      state: transaction.state,
      transaction: { ...transaction, redirectUri: "wrong" },
    },
    "invalid_transaction",
  ],
  [
    { code: "code", state: transaction.state, transaction: { ...transaction, scopes: null } },
    "invalid_transaction",
  ],
  [
    {
      code: "code",
      state: transaction.state,
      transaction: { ...transaction, scopes: ["profile"] },
    },
    "invalid_transaction",
  ],
  [
    {
      code: "code",
      state: transaction.state,
      transaction: { ...transaction, resource: undefined },
    },
    "invalid_transaction",
  ],
])("rejects invalid callback input with %s", (input, code) => {
  try {
    validateTransaction(input, config);
  } catch (error) {
    expect(error.code).toBe(code);
    if (input.error === "access_denied") expect(error.oauthCode).toBe("access_denied");
    return;
  }
  throw new Error("Expected transaction validation to fail.");
});
