import { expect, test } from "@jest/globals";
import { ElidClientError } from "../../../src/client/errors/client-error.mjs";

test("creates a client error without an HTTP status", () => {
  const error = new ElidClientError("bad_request", "Request rejected.");
  expect(error).toMatchObject({ name: "ElidClientError", code: "bad_request" });
  expect(error.message).toBe("Request rejected.");
  expect(error.status).toBeUndefined();
});

test("includes an HTTP status when supplied", () => {
  expect(new ElidClientError("http_error", "Request rejected.", 401).status).toBe(401);
});
