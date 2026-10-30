import { expect, test } from "@jest/globals";
import { readError } from "../../../../src/client/http/read/error.mjs";

function response(body, contentType = "application/json") {
  return {
    status: 400,
    headers: { get: () => contentType },
    text: async () => body,
  };
}

test("maps HTTP failures to a generic safe error", () => {
  for (const result of [
    response("{", "application/json"),
    response("x".repeat(1000001), "application/json"),
    response('{"error":5}', "application/json"),
    response("private detail", "text/plain"),
    { status: 400 },
  ]) {
    expect(readError(result)).toMatchObject({
      code: "http_error",
      status: result.status,
      message: "The identity provider rejected the request.",
    });
  }
});
