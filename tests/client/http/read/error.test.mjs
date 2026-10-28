import { expect, test } from "@jest/globals";
import { readError } from "../../../../src/client/http/read/error.mjs";

function response(body, contentType = "application/json") {
  return {
    status: 400,
    headers: { get: () => contentType },
    text: async () => body,
  };
}

test("maps OAuth error responses to safe typed errors", async () => {
  await expect(readError(response('{"error":"invalid_grant"}'))).resolves.toMatchObject({
    code: "oauth_error",
    oauthCode: "invalid_grant",
    status: 400,
    message: "The identity provider returned an OAuth error.",
  });
});

test("maps malformed, oversized, and non-JSON error responses safely", async () => {
  for (const result of [
    response("{", "application/json"),
    response("x".repeat(1000001), "application/json"),
    response('{"error":5}', "application/json"),
    response("private detail", "text/plain"),
    { status: 400 },
  ]) {
    await expect(readError(result)).resolves.toMatchObject({
      code: "http_error",
      status: result.status,
      message: "The identity provider rejected the request.",
    });
  }
});
