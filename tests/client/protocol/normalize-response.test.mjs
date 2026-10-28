import { expect, test } from "@jest/globals";
import { normalizeTokenResponse } from "../../../src/client/protocol/normalize-response.mjs";

test("normalizes an OAuth token response", () => {
  expect(
    normalizeTokenResponse({
      access_token: "opaque-access",
      refresh_token: "refresh",
      token_type: "bearer",
      expires_in: 3600,
      scope: "openid profile",
      id_token: "signed-id-token",
    }),
  ).toEqual({
    accessToken: "opaque-access",
    refreshToken: "refresh",
    tokenType: "Bearer",
    expiresIn: 3600,
    scope: "openid profile",
    idToken: "signed-id-token",
  });
});

test("allows optional token response fields", () => {
  expect(normalizeTokenResponse({ access_token: "access", token_type: "Bearer" })).toMatchObject({
    accessToken: "access",
    tokenType: "Bearer",
  });
});

test("rejects malformed token response fields", () => {
  for (const response of [
    {},
    { access_token: "", token_type: "Bearer" },
    { access_token: "a", token_type: "mac" },
    { access_token: "a", token_type: "Bearer", refresh_token: 3 },
    { access_token: "a", token_type: "Bearer", id_token: 3 },
    { access_token: "a", token_type: "Bearer", expires_in: 0 },
    { access_token: "a", token_type: "Bearer", expires_in: "3600" },
    { access_token: "a", token_type: "Bearer", scope: 4 },
  ]) {
    expect(() => normalizeTokenResponse(response)).toThrow();
  }
});
