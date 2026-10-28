import { createRemoteJWKSet, customFetch } from "jose";

export function createJwksResolver(fetchImplementation, metadata, timeoutMs) {
  return createRemoteJWKSet(new URL(metadata.jwks_uri), {
    timeoutDuration: timeoutMs,
    [customFetch]: fetchImplementation,
  });
}
