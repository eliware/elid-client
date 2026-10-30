import { expect, jest, test } from "@jest/globals";
import { createMetadataLoader } from "../../../../src/client/discovery/create/loader.mjs";

function metadata(overrides = {}) {
  return {
    issuer: "https://issuer.example",
    authorization_endpoint: "https://issuer.example/authorize",
    token_endpoint: "https://issuer.example/token",
    userinfo_endpoint: "https://issuer.example/userinfo",
    revocation_endpoint: "https://issuer.example/revoke",
    jwks_uri: "https://issuer.example/jwks",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    id_token_signing_alg_values_supported: ["none", "RS256"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "none"],
    scopes_supported: ["openid", "profile"],
    ...overrides,
  };
}

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify(body),
  };
}

function config(fetch, extra = {}) {
  return {
    issuer: "https://issuer.example",
    issuerUrl: new URL("https://issuer.example"),
    fetch,
    now: () => 1000,
    timeoutMs: 500,
    metadataCacheMs: 3000,
    ...extra,
  };
}

test("loads, validates, and caches issuer metadata", async () => {
  const fetcher = jest.fn(async () => jsonResponse(metadata()));
  const logger = { info: jest.fn(), debug: jest.fn() };
  const load = createMetadataLoader(config(fetcher, { logger }));
  const first = await load();
  const second = await load();
  expect(first).toBe(second);
  expect(first.id_token_signing_alg_values_supported).toEqual(["RS256"]);
  expect(first.token_endpoint_auth_methods_supported).toEqual(["client_secret_basic", "none"]);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(logger.info).toHaveBeenCalledWith("Issuer metadata loaded", {
    operation: "discoverIssuer",
  });
  expect(logger.debug).toHaveBeenCalledWith("Issuer metadata request started", {
    operation: "discoverIssuer",
  });
  expect(logger.debug).toHaveBeenCalledWith("Issuer metadata cache hit", {
    operation: "discoverIssuer",
  });
  expect(fetcher.mock.calls[0][0].href).toBe(
    "https://issuer.example/.well-known/openid-configuration",
  );
});

test("refreshes expired metadata and supports issuer paths", async () => {
  let now = 0;
  const fetcher = jest.fn(async () =>
    jsonResponse(metadata({ issuer: "https://issuer.example/tenant" })),
  );
  const load = createMetadataLoader(
    config(fetcher, {
      issuer: "https://issuer.example/tenant",
      issuerUrl: new URL("https://issuer.example/tenant"),
      now: () => now,
      metadataCacheMs: 10,
    }),
  );
  await load();
  now = 11;
  await load();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][0].pathname).toBe("/tenant/.well-known/openid-configuration");
});

test("shares concurrent metadata requests", async () => {
  let resolveResponse;
  const fetcher = jest.fn(
    () =>
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
  );
  const logger = { info: jest.fn(), debug: jest.fn() };
  const load = createMetadataLoader(config(fetcher, { logger }));
  const first = load();
  const second = load();
  expect(fetcher).toHaveBeenCalledTimes(1);
  resolveResponse(jsonResponse(metadata()));
  await expect(Promise.all([first, second])).resolves.toEqual([await first, await first]);
  expect(logger.debug).toHaveBeenCalledWith("Issuer metadata request already in progress", {
    operation: "discoverIssuer",
  });
});
