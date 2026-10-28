import { expect, test } from "@jest/globals";
import { validateScopes } from "../../../../src/client/options/validate/scopes.mjs";

test("copies valid unique OAuth scopes with or without openid", () => {
  const scopes = ["openid", "profile"];
  const result = validateScopes(scopes);
  expect(result).toEqual(scopes);
  expect(result).not.toBe(scopes);
});

test("accepts OAuth-only scopes", () => {
  expect(validateScopes(["funnel:read", "funnel:write"])).toEqual(["funnel:read", "funnel:write"]);
});

test("rejects missing, empty, malformed, duplicate, and non-OIDC scopes", () => {
  for (const scopes of [
    undefined,
    [],
    "openid",
    ["openid", "bad scope"],
    ["openid", 1],
    ["openid", "openid"],
  ]) {
    expect(() => validateScopes(scopes)).toThrow(
      "scopes must contain unique valid OAuth scope values",
    );
  }
});
