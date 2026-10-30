import { expect, test } from "@jest/globals";
import { validateIdTokenClaims } from "../../../src/client/protocol/validate-id-token-claims.mjs";

test("coordinates identity, party, and nonce validation", () => {
  const payload = {
    sub: "user-1",
    iat: 100000,
    exp: 100300,
    aud: ["web-app", "other"],
    azp: "web-app",
    nonce: "nonce",
  };
  expect(
    validateIdTokenClaims(payload, {
      clientId: "web-app",
      nonce: "nonce",
      nowSeconds: 100000,
      clockToleranceSeconds: 5,
      maxIdTokenAgeSeconds: 86400,
    }),
  ).toBe(payload);
});
