import { expect, test } from "@jest/globals";
import { createClientAuthentication } from "../../../src/client/protocol/create-authentication.mjs";

test("uses HTTP Basic when the issuer advertises it", () => {
  const result = createClientAuthentication(
    { clientId: "web app", clientSecret: "secret:with space" },
    { token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"] },
  );
  const decoded = Buffer.from(
    result.headers.authorization.slice("Basic ".length),
    "base64",
  ).toString();
  expect(decoded).toBe("web+app:secret%3Awith+space");
  expect(result.parameters).toEqual({});
});

test("uses form credentials when the issuer only supports post authentication", () => {
  expect(
    createClientAuthentication(
      { clientId: "app", clientSecret: "secret" },
      { token_endpoint_auth_methods_supported: ["client_secret_post"] },
    ),
  ).toEqual({ headers: {}, parameters: { client_id: "app", client_secret: "secret" } });
});

test("uses public client authentication only when the issuer advertises none", () => {
  expect(
    createClientAuthentication(
      { clientId: "public" },
      { token_endpoint_auth_methods_supported: ["none"] },
    ),
  ).toEqual({ headers: {}, parameters: { client_id: "public" } });
});

test("rejects unsupported or missing client authentication", () => {
  expect(() =>
    createClientAuthentication(
      { clientId: "app", clientSecret: "secret" },
      { token_endpoint_auth_methods_supported: ["private_key_jwt"] },
    ),
  ).toThrow("The issuer does not support configured client authentication.");
  expect(() =>
    createClientAuthentication(
      { clientId: "public" },
      { token_endpoint_auth_methods_supported: ["client_secret_basic"] },
    ),
  ).toThrow("The issuer requires a confidential client secret.");
});
