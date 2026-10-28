import { expect, test } from "@jest/globals";
import { validateTokenResponse } from "../../../src/client/protocol/token-response.mjs";

test("accepts valid token response fields", () => {
  expect(() =>
    validateTokenResponse({
      access_token: "access",
      token_type: "Bearer",
      refresh_token: "refresh",
      id_token: "signed-token",
      expires_in: 3600,
      scope: "openid profile",
    }),
  ).not.toThrow();
  expect(() =>
    validateTokenResponse({ access_token: "access", token_type: "Bearer" }),
  ).not.toThrow();
});

test.each([
  [{}, "no access token"],
  [{ access_token: "", token_type: "Bearer" }, "no access token"],
  [{ access_token: "access", token_type: "mac" }, "unsupported token type"],
  [{ access_token: "access", token_type: "Bearer", refresh_token: 3 }, "invalid refresh token"],
  [{ access_token: "access", token_type: "Bearer", id_token: 3 }, "invalid ID Token"],
  [{ access_token: "access", token_type: "Bearer", expires_in: 0 }, "invalid token lifetime"],
  [{ access_token: "access", token_type: "Bearer", expires_in: "3600" }, "invalid token lifetime"],
  [{ access_token: "access", token_type: "Bearer", scope: 4 }, "invalid scope value"],
])("rejects malformed token response fields", (response) => {
  expect(() => validateTokenResponse(response)).toThrow(
    expect.objectContaining({ code: "invalid_token_response" }),
  );
});
