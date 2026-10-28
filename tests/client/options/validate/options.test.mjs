import { expect, test } from "@jest/globals";
import { validateOptions } from "../../../../src/client/options/validate/options.mjs";

const validOptions = {
  issuer: "https://issuer.example",
  clientId: "web-app",
  redirectUri: "https://app.example/callback",
  scopes: ["openid", "profile"],
};

test("validates and defaults client configuration", () => {
  expect(validateOptions(validOptions)).toMatchObject({
    issuer: validOptions.issuer,
    clientId: "web-app",
    redirectUri: validOptions.redirectUri,
    scopes: ["openid", "profile"],
    timeoutMs: 5000,
    metadataCacheMs: 300000,
    fetch: globalThis.fetch,
    now: Date.now,
  });
});

test("accepts optional settings and loopback HTTP issuers", () => {
  const options = {
    ...validOptions,
    issuer: "http://localhost:18443",
    clientSecret: "secret",
    resource: "https://api.example/v1?tenant=a",
    timeoutMs: 1000,
    metadataCacheMs: 0,
    fetch: async () => {},
    now: () => 1,
    logger: { info: () => {} },
  };
  expect(validateOptions(options)).toMatchObject({
    ...options,
    issuerUrl: new URL(options.issuer),
  });
});

test("rejects invalid client settings", () => {
  expect(() => validateOptions()).toThrow();
  for (const options of [
    { ...validOptions, clientId: "" },
    { ...validOptions, clientId: 1 },
    { ...validOptions, redirectUri: "https://app.example/callback?next=1" },
    { ...validOptions, redirectUri: "https://app.example/callback#part" },
    { ...validOptions, clientSecret: "" },
    { ...validOptions, clientSecret: 4 },
    { ...validOptions, timeoutMs: 0 },
    { ...validOptions, timeoutMs: 1.5 },
    { ...validOptions, metadataCacheMs: -1 },
    { ...validOptions, metadataCacheMs: 0.5 },
    { ...validOptions, clockToleranceSeconds: -1 },
    { ...validOptions, clockToleranceSeconds: 0.5 },
    { ...validOptions, fetch: 1 },
    { ...validOptions, now: 1 },
    { ...validOptions, logger: null },
    { ...validOptions, logger: {} },
    { ...validOptions, resource: "http://api.example" },
  ]) {
    expect(() => validateOptions(options)).toThrow();
  }
});
