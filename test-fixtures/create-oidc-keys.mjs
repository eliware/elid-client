import { exportJWK, generateKeyPair } from "jose";

export async function createOidcKeys() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  Object.assign(jwk, { alg: "RS256", kid: "smoke-test-key", use: "sig" });
  return {
    jwks: { keys: [jwk] },
    privateKey,
    publicKey,
  };
}
