import { expect, test } from "@jest/globals";
import { validateIdTokenIdentity } from "../../../../src/client/protocol/validate-id-token-claims/identity.mjs";

const nowSeconds = 100000;
const claims = { sub: "user-1", iat: nowSeconds, exp: nowSeconds + 300 };
const options = { nowSeconds, clockToleranceSeconds: 5, maxIdTokenAgeSeconds: 86400 };

test("accepts a current subject and valid token times", () => {
  expect(validateIdTokenIdentity(claims, options)).toBeUndefined();
});

test.each([
  [{ ...claims, sub: undefined }],
  [{ ...claims, sub: "" }],
  [{ ...claims, iat: undefined }],
  [{ ...claims, iat: Number.NaN }],
  [{ ...claims, exp: undefined }],
  [{ ...claims, exp: Number.POSITIVE_INFINITY }],
  [{ ...claims, iat: nowSeconds + 6 }],
  [{ ...claims, iat: nowSeconds - 86406 }],
])("rejects invalid subject or time claims", (payload) => {
  expect(() => validateIdTokenIdentity(payload, options)).toThrow(/identity or time claims/);
});
