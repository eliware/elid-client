import { expect, test } from "@jest/globals";
import { validateCapabilities } from "../../../../src/client/discovery/validate/capabilities.mjs";

const capabilities = (overrides = {}) => ({
  code_challenge_methods_supported: ["S256"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  response_types_supported: ["code"],
  id_token_signing_alg_values_supported: ["none", "RS256"],
  scopes_supported: ["openid", "profile"],
  ...overrides,
});

test("keeps supported signing algorithms and freezes scope metadata", () => {
  const result = validateCapabilities(capabilities());
  expect(result.id_token_signing_alg_values_supported).toEqual(["RS256"]);
  expect(Object.isFrozen(result.id_token_signing_alg_values_supported)).toBe(true);
  expect(Object.isFrozen(result.scopes_supported)).toBe(true);
});

test("accepts omitted optional grant, response, and scope metadata", () => {
  expect(
    validateCapabilities(
      capabilities({
        grant_types_supported: undefined,
        response_types_supported: undefined,
        scopes_supported: undefined,
      }),
    ),
  ).not.toHaveProperty("scopes_supported");
});

test.each([
  [{ code_challenge_methods_supported: ["plain"] }],
  [{ code_challenge_methods_supported: "S256" }],
  [{ grant_types_supported: ["client_credentials"] }],
  [{ grant_types_supported: "authorization_code" }],
  [{ response_types_supported: ["token"] }],
  [{ response_types_supported: 1 }],
  [{ id_token_signing_alg_values_supported: ["none", "HS256"] }],
  [{ id_token_signing_alg_values_supported: undefined }],
  [{ scopes_supported: ["openid", 7] }],
  [{ scopes_supported: "openid profile" }],
])("rejects unsupported protocol capabilities", (overrides) => {
  expect(() => validateCapabilities(capabilities(overrides))).toThrow(
    expect.objectContaining({ code: "unsupported_provider" }),
  );
});
