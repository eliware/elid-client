import { expect, jest, test } from "@jest/globals";
import { createOidcKeys } from "../../../test-fixtures/create-oidc-keys.mjs";
import { signIdToken } from "../../../test-fixtures/sign-id-token.mjs";
import { createIdTokenVerifier } from "../../../src/client/protocol/id-token-verifier.mjs";

const issuer = "https://issuer.example";
const now = Date.UTC(2026, 0, 1);

test("reuses a JWKS resolver until the metadata URI changes", async () => {
  const keys = await createOidcKeys();
  const fetch = jest.fn(async () => new Response(JSON.stringify(keys.jwks)));
  const verifyClaims = createIdTokenVerifier({
    clientId: "web-app",
    issuer,
    fetch,
    now: () => now,
    timeoutMs: 1000,
    clockToleranceSeconds: 0,
    maxIdTokenAgeSeconds: 86400,
  });
  const metadata = {
    jwks_uri: `${issuer}/jwks`,
    id_token_signing_alg_values_supported: ["RS256"],
  };
  const token = await signIdToken(
    keys.privateKey,
    { nonce: "nonce", iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer,
      audience: "web-app",
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );

  await expect(verifyClaims(token, "nonce", metadata, false)).resolves.toMatchObject({
    sub: "user-1",
  });
  await verifyClaims(token, "nonce", metadata, false);
  await verifyClaims(token, "nonce", { ...metadata, jwks_uri: `${issuer}/next-jwks` }, false);
  expect(fetch).toHaveBeenCalledTimes(2);
});
