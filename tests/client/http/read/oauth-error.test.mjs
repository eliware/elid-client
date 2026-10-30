import { expect, test } from "@jest/globals";
import { readOAuthError } from "../../../../src/client/http/read/oauth-error.mjs";

function response(body, contentType = "application/json") {
  return {
    status: 400,
    headers: { get: () => contentType },
    text: async () => body,
  };
}

test("extracts an OAuth error code from a JSON error response", async () => {
  await expect(readOAuthError(response('{"error":"invalid_grant"}'))).resolves.toMatchObject({
    code: "oauth_error",
    oauthCode: "invalid_grant",
    status: 400,
    message: "The identity provider returned an OAuth error.",
  });
});

test("returns no OAuth error for malformed, oversized, or non-OAuth responses", async () => {
  for (const result of [
    response("{", "application/json"),
    response("x".repeat(1000001), "application/json"),
    response('{"error":5}', "application/json"),
    response("private detail", "text/plain"),
    { status: 400 },
  ]) {
    await expect(readOAuthError(result)).resolves.toBeUndefined();
  }
});
