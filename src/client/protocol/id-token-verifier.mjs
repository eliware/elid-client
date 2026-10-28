import { createJwksResolver } from "../discovery/create/jwks-resolver.mjs";
import { verifyIdToken } from "./verify-id-token.mjs";

export function createIdTokenVerifier(config) {
  let jwksUri;
  let keyResolver;
  return async function verifyClaims(idToken, nonce, metadata, allowMissingNonce) {
    if (!keyResolver || jwksUri !== metadata.jwks_uri) {
      jwksUri = metadata.jwks_uri;
      keyResolver = createJwksResolver(config.fetch, metadata, config.timeoutMs);
    }
    return verifyIdToken(idToken, {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce,
      algorithms: metadata.id_token_signing_alg_values_supported,
      now: config.now,
      clockToleranceSeconds: config.clockToleranceSeconds,
      maxIdTokenAgeSeconds: config.maxIdTokenAgeSeconds,
      allowMissingNonce,
      keyResolver,
    });
  };
}
