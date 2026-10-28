import { expect, test } from "@jest/globals";
import { readResponseFallback } from "../../../../../src/client/http/read/response/fallback.mjs";

test("reads text fallback responses", async () => {
  await expect(readResponseFallback({ text: async () => "plain" })).resolves.toBe("plain");
});

test("rejects oversized fallback bodies", async () => {
  await expect(
    readResponseFallback({ text: async () => "x".repeat(1000001) }),
  ).rejects.toMatchObject({
    code: "invalid_response",
    message: "The identity provider response is too large.",
  });
});

test("maps fallback body read failures safely", async () => {
  await expect(
    readResponseFallback({ text: async () => Promise.reject(new Error("private body detail")) }),
  ).rejects.toMatchObject({
    code: "invalid_response",
    message: "The identity provider response could not be read.",
  });
});
