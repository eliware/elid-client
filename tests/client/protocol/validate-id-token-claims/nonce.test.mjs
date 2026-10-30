import { expect, test } from "@jest/globals";
import { validateIdTokenNonce } from "../../../../src/client/protocol/validate-id-token-claims/nonce.mjs";

test("requires a matching nonce unless a refresh token omits it", () => {
  expect(validateIdTokenNonce({ nonce: "nonce" }, { nonce: "nonce" })).toBeUndefined();
  expect(validateIdTokenNonce({}, { nonce: "nonce", allowMissingNonce: true })).toBeUndefined();
  expect(() => validateIdTokenNonce({}, { nonce: "nonce" })).toThrow("nonce");
  expect(() =>
    validateIdTokenNonce({ nonce: "other" }, { nonce: "nonce", allowMissingNonce: true }),
  ).toThrow("nonce");
});
