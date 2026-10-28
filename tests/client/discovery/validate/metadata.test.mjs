import { expect, test } from "@jest/globals";
import { validateMetadata } from "../../../../src/client/discovery/validate/metadata.mjs";

const issuer = "https://issuer.example";
const metadata = (overrides = {}) => ({
  issuer,
  authorization_endpoint: `${issuer}/authorize`,
  token_endpoint: `${issuer}/token`,
  userinfo_endpoint: `${issuer}/userinfo`,
  revocation_endpoint: `${issuer}/revoke`,
  jwks_uri: `${issuer}/jwks`,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  code_challenge_methods_supported: ["S256"],
  id_token_signing_alg_values_supported: ["none", "RS256"],
  token_endpoint_auth_methods_supported: ["client_secret_basic", "none"],
  scopes_supported: ["openid", "profile"],
  ...overrides,
});

test("validates issuer metadata and freezes supported capabilities", () => {
  const result = validateMetadata(metadata(), issuer);
  expect(result.id_token_signing_alg_values_supported).toEqual(["RS256"]);
  expect(result.token_endpoint_auth_methods_supported).toEqual(["client_secret_basic", "none"]);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.scopes_supported)).toBe(true);
});

test("rejects a mismatched issuer", () => {
  expect(() => validateMetadata(metadata({ issuer: "https://other.example" }), issuer)).toThrow(
    expect.objectContaining({ code: "issuer_mismatch" }),
  );
});
