import { ElidClientError } from "../errors/client-error.mjs";
import { normalizeTokenResponse } from "./normalize-response.mjs";

export function createTokenResponseCompleter(config, verifyClaims) {
  return async function completeTokenResponse(
    response,
    nonce,
    metadata,
    requireIdToken,
    allowMissingNonce,
    priorIdentity,
  ) {
    const tokens = normalizeTokenResponse(response);
    if (!config.scopes.includes("openid")) {
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn,
        scope: tokens.scope,
      };
    }
    if (!tokens.idToken && requireIdToken) {
      throw new ElidClientError(
        "invalid_token_response",
        "The issuer returned no ID Token for the openid scope.",
      );
    }
    if (!tokens.idToken) return priorIdentity ? { ...tokens, identity: priorIdentity } : tokens;
    const idTokenClaims = await verifyClaims(tokens.idToken, nonce, metadata, allowMissingNonce);
    return {
      ...tokens,
      idTokenClaims,
      identity: { issuer: idTokenClaims.iss, subject: idTokenClaims.sub },
    };
  };
}
