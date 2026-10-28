import { expect, jest, test } from "@jest/globals";
import { requestRefreshToken } from "../../../src/client/protocol/refresh.mjs";

test("refreshes tokens and repeats the configured resource", async () => {
  const fetcher = jest.fn(async (_url, options) => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ access_token: "next", token_type: "Bearer" }),
    options,
  }));
  await expect(
    requestRefreshToken(
      fetcher,
      {
        clientId: "web-app",
        clientSecret: "secret",
        resource: "https://api.example",
        timeoutMs: 500,
      },
      {
        token_endpoint: "https://issuer.example/token",
        token_endpoint_auth_methods_supported: ["client_secret_post"],
        grant_types_supported: ["authorization_code", "refresh_token"],
      },
      "refresh-token",
    ),
  ).resolves.toMatchObject({ access_token: "next" });
  expect(fetcher.mock.calls[0][1].body.toString()).toContain("grant_type=refresh_token");
  expect(fetcher.mock.calls[0][1].body.toString()).toContain("resource=https%3A%2F%2Fapi.example");
});

test("rejects missing refresh tokens and unsupported refresh grants", async () => {
  await expect(requestRefreshToken(async () => {}, {}, {}, "")).rejects.toMatchObject({
    code: "invalid_argument",
  });
  await expect(
    requestRefreshToken(
      async () => {},
      {},
      { grant_types_supported: ["authorization_code"] },
      "refresh-token",
    ),
  ).rejects.toMatchObject({ code: "unsupported_provider" });
});

test("refreshes without a resource indicator", async () => {
  const fetcher = jest.fn(async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ access_token: "next", token_type: "Bearer" }),
  }));
  await requestRefreshToken(
    fetcher,
    { clientId: "public-app", timeoutMs: 500 },
    {
      token_endpoint: "https://issuer.example/token",
      token_endpoint_auth_methods_supported: ["none"],
    },
    "refresh-token",
  );
  expect(fetcher.mock.calls[0][1].body.toString()).not.toContain("resource=");
});
