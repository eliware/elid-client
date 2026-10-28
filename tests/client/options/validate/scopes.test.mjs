import { expect, test } from "@jest/globals";
import { validateScopes } from "../../../../src/client/options/validate/scopes.mjs";

test("copies valid unique OAuth scopes that include openid", () => {
  const scopes = ["openid", "profile"];
  const result = validateScopes(scopes);
  expect(result).toEqual(scopes);
  expect(result).not.toBe(scopes);
});

test("rejects missing, empty, malformed, duplicate, and non-OIDC scopes", () => {
  for (const scopes of [
    undefined,
    [],
    "openid",
    ["openid", "bad scope"],
    ["openid", 1],
    ["openid", "openid"],
    ["profile"],
  ]) {
    expect(() => validateScopes(scopes)).toThrow("scopes must contain unique OAuth scope values");
  }
});
