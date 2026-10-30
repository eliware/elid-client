import { expect, test } from "@jest/globals";
import { validateAuthorizationResponse } from "../../../../src/client/authorization/validate-transaction/response.mjs";

function captureError(callback) {
  try {
    callback();
  } catch (error) {
    return error;
  }
}

test("accepts a nonempty authorization code", () => {
  expect(validateAuthorizationResponse({ code: "code-value" })).toBeUndefined();
});

test("maps an authorization denial and retains a string OAuth code", () => {
  expect(
    captureError(() => validateAuthorizationResponse({ error: "access_denied" })),
  ).toMatchObject({
    code: "authorization_error",
    oauthCode: "access_denied",
  });
});

test("maps nonstring denial details without exposing an OAuth code", () => {
  const error = captureError(() => validateAuthorizationResponse({ error: 7 }));
  expect(error).toMatchObject({ code: "authorization_error" });
  expect(error).not.toHaveProperty("oauthCode");
});

test.each([undefined, "", 7])("rejects missing or invalid codes", (code) => {
  expect(captureError(() => validateAuthorizationResponse({ code }))).toMatchObject({
    code: "invalid_argument",
  });
});
