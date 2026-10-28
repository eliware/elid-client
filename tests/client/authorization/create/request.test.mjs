import { createHash } from "node:crypto";
import { expect, test } from "@jest/globals";
import { createAuthorizationRequest } from "../../../../src/client/authorization/create/request.mjs";

const config = {
  clientId: "web-app",
  redirectUri: "https://app.example/callback",
  scopes: ["openid", "profile"],
  resource: "https://api.example/v1?tenant=a",
};

test("creates a PKCE authorization request and one-time transaction values", () => {
  const request = createAuthorizationRequest(config, {
    authorization_endpoint: "https://issuer.example/authorize?existing=1",
    scopes_supported: ["openid", "profile"],
    resource_parameter_supported: true,
  });
  const url = new URL(request.authorizationUrl);
  const verifier = request.transaction.codeVerifier;
  expect(url.searchParams.get("client_id")).toBe(config.clientId);
  expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
  expect(url.searchParams.get("response_type")).toBe("code");
  expect(url.searchParams.get("scope")).toBe("openid profile");
  expect(url.searchParams.get("state")).toBe(request.transaction.state);
  expect(url.searchParams.get("nonce")).toBe(request.transaction.nonce);
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("code_challenge")).toBe(
    createHash("sha256").update(verifier).digest("base64url"),
  );
  expect(url.searchParams.get("resource")).toBe(config.resource);
  expect(request.transaction.codeVerifier).toBe(verifier);
});

test("omits resource when no resource is configured", () => {
  const request = createAuthorizationRequest(
    { ...config, resource: undefined },
    {
      authorization_endpoint: "https://issuer.example/authorize",
    },
  );
  expect(new URL(request.authorizationUrl).searchParams.has("resource")).toBe(false);
  expect(request.transaction.resource).toBeUndefined();
});

test("rejects unsupported scopes and resources before authorization", () => {
  expect(() =>
    createAuthorizationRequest(config, {
      authorization_endpoint: "https://issuer.example/authorize",
      scopes_supported: ["openid"],
      resource_parameter_supported: true,
    }),
  ).toThrow("The issuer does not advertise every configured scope.");
  expect(() =>
    createAuthorizationRequest(config, {
      authorization_endpoint: "https://issuer.example/authorize",
      scopes_supported: ["openid", "profile"],
      resource_parameter_supported: false,
    }),
  ).toThrow("The issuer does not support resource indicators.");
});
