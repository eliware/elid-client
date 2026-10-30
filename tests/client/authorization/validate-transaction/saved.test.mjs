import { expect, test } from "@jest/globals";
import { validateSavedTransaction } from "../../../../src/client/authorization/validate-transaction/saved.mjs";

const config = {
  redirectUri: "https://app.example/callback",
  scopes: ["openid", "profile"],
  resource: "https://api.example",
};
const transaction = {
  nonce: "nonce-value",
  codeVerifier: "a".repeat(43),
  redirectUri: config.redirectUri,
  scopes: config.scopes,
  resource: config.resource,
};

function expectInvalidTransaction(callback) {
  let error;
  try {
    callback();
  } catch (caught) {
    error = caught;
  }
  expect(error).toMatchObject({ code: "invalid_transaction" });
}

test("accepts matching saved transaction values", () => {
  expect(validateSavedTransaction(transaction, config)).toBeUndefined();
});

test.each([
  [{ ...transaction, nonce: undefined }, config],
  [{ ...transaction, nonce: "" }, config],
  [
    { ...transaction, nonce: "nonce-value" },
    { ...config, scopes: ["api.read"] },
  ],
  [{ ...transaction, codeVerifier: undefined }, config],
  [{ ...transaction, codeVerifier: "short" }, config],
  [{ ...transaction, codeVerifier: "a".repeat(129) }, config],
  [{ ...transaction, redirectUri: "https://other.example/callback" }, config],
  [{ ...transaction, scopes: null }, config],
  [{ ...transaction, scopes: ["profile"] }, config],
  [{ ...transaction, resource: undefined }, config],
])("rejects a saved transaction that differs from client settings", (saved, options) => {
  expectInvalidTransaction(() => validateSavedTransaction(saved, options));
});

test("rejects a nonce in an OAuth-only transaction", () => {
  expectInvalidTransaction(() =>
    validateSavedTransaction(
      { ...transaction, nonce: "nonce-value", scopes: ["api.read"] },
      { ...config, scopes: ["api.read"] },
    ),
  );
});
