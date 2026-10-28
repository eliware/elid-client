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
