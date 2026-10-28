import { jwtVerify } from "jose";
import { expect, jest, test } from "@jest/globals";
import { createOidcKeys } from "../../../../test-fixtures/create-oidc-keys.mjs";
import { signIdToken } from "../../../../test-fixtures/sign-id-token.mjs";
import { createJwksResolver } from "../../../../src/client/discovery/create/jwks-resolver.mjs";

test("resolves and caches public JWKS keys with injected safe fetch", async () => {
  const keys = await createOidcKeys();
  const issuedAt = 1_893_456_000;
  const fetcher = jest.fn(async (_url, options) => {
    expect(options.redirect).toBe("error");
    return new Response(JSON.stringify(keys.jwks), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  const resolver = createJwksResolver(fetcher, { jwks_uri: "https://issuer.example/jwks" }, 1000);
  const token = await signIdToken(
    keys.privateKey,
    { iat: issuedAt, exp: issuedAt + 600 },
    {
      issuer: "https://issuer.example",
      audience: "web-app",
      subject: "user-1",
      issuedAt,
      expiresAt: issuedAt + 600,
    },
  );
  const options = {
    issuer: "https://issuer.example",
    audience: "web-app",
    algorithms: ["RS256"],
    currentDate: new Date(issuedAt * 1000),
  };
  await expect(jwtVerify(token, resolver, options)).resolves.toMatchObject({
    payload: { sub: "user-1" },
  });
  await expect(jwtVerify(token, resolver, options)).resolves.toMatchObject({
    payload: { sub: "user-1" },
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
