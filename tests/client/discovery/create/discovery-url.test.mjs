import { expect, test } from "@jest/globals";
import { createDiscoveryUrl } from "../../../../src/client/discovery/create/discovery-url.mjs";

test("creates a discovery URL for root and path issuers", () => {
  expect(createDiscoveryUrl(new URL("https://issuer.example")).href).toBe(
    "https://issuer.example/.well-known/openid-configuration",
  );
  expect(createDiscoveryUrl(new URL("https://issuer.example/tenant/")).href).toBe(
    "https://issuer.example/tenant/.well-known/openid-configuration",
  );
});
