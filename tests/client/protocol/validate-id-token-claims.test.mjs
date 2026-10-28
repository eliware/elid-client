import { expect, test } from "@jest/globals";
import { validateIdTokenClaims } from "../../../src/client/protocol/validate-id-token-claims.mjs";

const nowSeconds = 100000;
const claims = { sub: "user-1", iat: nowSeconds, exp: nowSeconds + 300, nonce: "nonce" };
const options = {
  clientId: "web-app",
  nonce: "nonce",
  nowSeconds,
  clockToleranceSeconds: 5,
  maxIdTokenAgeSeconds: 86400,
};

test("accepts current identity claims and matching audience party", () => {
  expect(
    validateIdTokenClaims({ ...claims, aud: ["web-app", "other"], azp: "web-app" }, options),
  ).toMatchObject({ sub: "user-1" });
});

test("rejects old issue times and invalid identity claims", () => {
  expect(() => validateIdTokenClaims({ ...claims, iat: nowSeconds - 86406 }, options)).toThrow();
  expect(() => validateIdTokenClaims({ ...claims, sub: "" }, options)).toThrow();
  expect(() => validateIdTokenClaims({ ...claims, exp: undefined }, options)).toThrow();
});

test("rejects invalid parties and nonce values", () => {
  expect(() => validateIdTokenClaims({ ...claims, azp: "other" }, options)).toThrow();
  expect(() => validateIdTokenClaims({ ...claims, aud: ["web-app", "other"] }, options)).toThrow();
  expect(() => validateIdTokenClaims({ ...claims, nonce: "other" }, options)).toThrow(
    "ID Token nonce does not match the authorization transaction.",
  );
});
