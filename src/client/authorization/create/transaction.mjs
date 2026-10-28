import { randomBytes } from "node:crypto";

export function createAuthorizationTransaction(config) {
  return {
    state: randomBytes(32).toString("base64url"),
    ...(config.scopes.includes("openid") && {
      nonce: randomBytes(32).toString("base64url"),
    }),
    codeVerifier: randomBytes(32).toString("base64url"),
    redirectUri: config.redirectUri,
    scopes: [...config.scopes],
    resource: config.resource,
  };
}
