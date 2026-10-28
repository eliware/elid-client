import { expect, jest, test } from "@jest/globals";
import { revokeToken } from "../../../src/client/protocol/revoke.mjs";

function successfulResponse(status = 200) {
  return {
    ok: true,
    status,
    headers: { get: () => "" },
    text: async () => "",
  };
}

test("revokes an opaque token using the discovered endpoint", async () => {
  const fetcher = jest.fn(async () => successfulResponse());
  await expect(
    revokeToken(
      fetcher,
      { clientId: "web-app", clientSecret: "secret", timeoutMs: 1000 },
      {
        revocation_endpoint: "https://issuer.example/revoke",
        token_endpoint_auth_methods_supported: ["client_secret_basic"],
      },
      "opaque-refresh-token",
      "refresh_token",
    ),
  ).resolves.toBeUndefined();
  expect(fetcher.mock.calls[0][0]).toBe("https://issuer.example/revoke");
  expect(fetcher.mock.calls[0][1]).toMatchObject({ method: "POST", redirect: "error" });
  expect(fetcher.mock.calls[0][1].body.toString()).toContain("token=opaque-refresh-token");
  expect(fetcher.mock.calls[0][1].body.toString()).toContain("token_type_hint=refresh_token");
});

test("supports an empty 204 response and optional token type hint", async () => {
  const fetcher = jest.fn(async () => successfulResponse(204));
  await expect(
    revokeToken(
      fetcher,
      { clientId: "public", timeoutMs: 1000 },
      {
        revocation_endpoint: "https://issuer.example/revoke",
        token_endpoint_auth_methods_supported: ["none"],
      },
      "opaque-access-token",
    ),
  ).resolves.toBeUndefined();
  expect(fetcher.mock.calls[0][1].body.toString()).toBe(
    "token=opaque-access-token&client_id=public",
  );
});

test("rejects missing endpoint, empty tokens, and invalid token hints", async () => {
  await expect(revokeToken(async () => {}, {}, {}, "token")).rejects.toMatchObject({
    code: "unsupported_provider",
  });
  await expect(
    revokeToken(async () => {}, {}, { revocation_endpoint: "https://issuer.example/revoke" }, ""),
  ).rejects.toMatchObject({ code: "invalid_argument" });
  await expect(
    revokeToken(
      async () => {},
      {},
      { revocation_endpoint: "https://issuer.example/revoke" },
      "token",
      "id_token",
    ),
  ).rejects.toMatchObject({ code: "invalid_argument" });
});
