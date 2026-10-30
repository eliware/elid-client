import { expect, jest, test } from "@jest/globals";
import { ElidClientError } from "../../../src/client/errors/client-error.mjs";
import { requestJson } from "../../../src/client/http/request-json.mjs";

function jsonResponse(value, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json; charset=utf-8" },
    text: async () => JSON.stringify(value),
  };
}

test("requests JSON with safe defaults and returns an object", async () => {
  const fetcher = jest.fn(async () => jsonResponse({ value: true }));
  await expect(requestJson(fetcher, "https://issuer.example/metadata")).resolves.toEqual({
    value: true,
  });
  expect(fetcher.mock.calls[0][1]).toMatchObject({ method: "GET", redirect: "error" });
});

test("retries a transient GET once", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse({}, 503))
    .mockResolvedValueOnce(jsonResponse({ ready: true }));
  await expect(requestJson(fetcher, "https://issuer.example/metadata")).resolves.toEqual({
    ready: true,
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test("does not retry unsafe or repeated transient requests", async () => {
  for (const options of [{ method: "POST" }, { method: "GET", retry: false }]) {
    const fetcher = jest.fn(async () => jsonResponse({}, 503));
    await expect(
      requestJson(fetcher, "https://issuer.example/token", options),
    ).rejects.toMatchObject({
      code: "http_error",
      status: 503,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
  const fetcher = jest.fn(async () => jsonResponse({}, 400));
  await expect(
    requestJson(fetcher, "https://issuer.example/token", { method: "POST" }),
  ).rejects.toMatchObject({
    code: "http_error",
    status: 400,
  });
});

test("maps timeouts and network errors without leaking details", async () => {
  await expect(
    requestJson(async () => {
      throw new DOMException("sensitive detail", "AbortError");
    }, "https://issuer.example"),
  ).rejects.toMatchObject({
    code: "request_timeout",
    message: "The identity provider request timed out.",
  });
  await expect(
    requestJson(async () => {
      throw new Error("private network detail");
    }, "https://issuer.example"),
  ).rejects.toMatchObject({
    code: "network_error",
    message: "The identity provider request failed.",
  });
  const original = new ElidClientError("custom", "safe message");
  await expect(
    requestJson(async () => {
      throw original;
    }, "https://issuer.example"),
  ).rejects.toBe(original);
});

test("accepts an empty success only when requested", async () => {
  const fetcher = async () => ({ ok: true, status: 204 });
  await expect(
    requestJson(fetcher, "https://issuer.example/revoke", { allowEmpty: true }),
  ).resolves.toBeUndefined();
  await expect(requestJson(fetcher, "https://issuer.example/revoke")).rejects.toMatchObject({
    code: "invalid_response",
  });
  const empty = async () => ({ ...jsonResponse({}), text: async () => "" });
  await expect(
    requestJson(empty, "https://issuer.example/revoke", { allowEmpty: true }),
  ).resolves.toBeUndefined();
});

test("rejects non-JSON, oversized, malformed, and non-object responses", async () => {
  const response = (text, contentType = "application/json") => ({
    ok: true,
    status: 200,
    headers: { get: () => contentType },
    text: async () => text,
  });
  for (const result of [
    response("{}", "text/plain"),
    response("x".repeat(1000001)),
    response("{"),
    response("null"),
    response("[]"),
    response('"text"'),
    { ok: true, status: 200, text: async () => "{}" },
  ]) {
    await expect(requestJson(async () => result, "https://issuer.example")).rejects.toMatchObject({
      code: "invalid_response",
    });
  }
});

test("maps an OAuth error body to a typed error", async () => {
  await expect(
    requestJson(
      async () => jsonResponse({ error: "invalid_grant", error_description: "secret" }, 400),
      "https://issuer.example/token",
      { method: "POST" },
    ),
  ).rejects.toMatchObject({ code: "oauth_error", oauthCode: "invalid_grant", status: 400 });
  await expect(
    requestJson(
      async () => jsonResponse({ error: "invalid_grant" }),
      "https://issuer.example/token",
    ),
  ).rejects.toMatchObject({ code: "oauth_error", oauthCode: "invalid_grant" });
});
