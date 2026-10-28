import { expect, test } from "@jest/globals";
import { validateEndpoints } from "../../../../src/client/discovery/validate/endpoints.mjs";

const issuer = "https://issuer.example";
const endpoints = (overrides = {}) => ({
  authorization_endpoint: `${issuer}/authorize`,
  token_endpoint: `${issuer}/token`,
  jwks_uri: `${issuer}/jwks`,
  userinfo_endpoint: `${issuer}/userinfo`,
  revocation_endpoint: `${issuer}/revoke`,
  ...overrides,
});

test("accepts required endpoints and omits optional endpoints", () => {
  expect(() => validateEndpoints(endpoints())).not.toThrow();
  expect(() =>
    validateEndpoints(endpoints({ userinfo_endpoint: undefined, revocation_endpoint: undefined })),
  ).not.toThrow();
});

test.each([
  [{ authorization_endpoint: "https://@issuer.example/authorize" }],
  [{ token_endpoint: "http://attacker.example/token" }],
  [{ jwks_uri: "not a URL" }],
  [{ userinfo_endpoint: "https://issuer.example/userinfo?token=leak" }],
  [{ revocation_endpoint: "http://attacker.example/revoke" }],
])("rejects unsafe endpoint URLs", (overrides) => {
  expect(() => validateEndpoints(endpoints(overrides))).toThrow();
});
