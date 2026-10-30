import { expect, test } from "@jest/globals";
import { validateClientSettings } from "../../../../src/client/options/validate/client-settings.mjs";

const valid = { clientId: "web-app" };

test("accepts defaults and valid optional settings", () => {
  expect(validateClientSettings(valid)).toMatchObject({
    clientId: "web-app",
    timeoutMs: 5000,
    metadataCacheMs: 300000,
    clockToleranceSeconds: 5,
    maxIdTokenAgeSeconds: 86400,
    fetch: globalThis.fetch,
    now: Date.now,
  });
  expect(
    validateClientSettings({
      ...valid,
      clientSecret: "secret",
      timeoutMs: 10,
      metadataCacheMs: 0,
      clockToleranceSeconds: 0,
      maxIdTokenAgeSeconds: 300,
      fetch: async () => {},
      now: () => 1,
      logger: { info: () => {} },
    }),
  ).toMatchObject({
    timeoutMs: 10,
    metadataCacheMs: 0,
    clockToleranceSeconds: 0,
    maxIdTokenAgeSeconds: 300,
  });
});

test.each([
  [{ clientId: "" }],
  [{ clientId: 1 }],
  [{ ...valid, clientSecret: "" }],
  [{ ...valid, clientSecret: 4 }],
  [{ ...valid, timeoutMs: 0 }],
  [{ ...valid, timeoutMs: 1.5 }],
  [{ ...valid, metadataCacheMs: -1 }],
  [{ ...valid, metadataCacheMs: 0.5 }],
  [{ ...valid, clockToleranceSeconds: -1 }],
  [{ ...valid, clockToleranceSeconds: 0.5 }],
  [{ ...valid, maxIdTokenAgeSeconds: 0 }],
  [{ ...valid, maxIdTokenAgeSeconds: 1.5 }],
  [{ ...valid, fetch: 1 }],
  [{ ...valid, now: 1 }],
  [{ ...valid, logger: null }],
  [{ ...valid, logger: {} }],
  [{ ...valid, logger: { info: () => {}, debug: true } }],
])("rejects invalid scalar or dependency settings", (options) => {
  expect(() => validateClientSettings(options)).toThrow();
});
