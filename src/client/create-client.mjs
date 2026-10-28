import log from "@eliware/log";
import { createAuthorizationRequest } from "./authorization/create/request.mjs";
import { validateTransaction } from "./authorization/validate-transaction.mjs";
import { ElidClientError } from "./errors/client-error.mjs";
import { createMetadataLoader } from "./discovery/create/loader.mjs";
import { createJwksResolver } from "./discovery/create/jwks-resolver.mjs";
import { validateOptions } from "./options/validate/options.mjs";
import { normalizeTokenResponse } from "./protocol/normalize-response.mjs";
import { requestRefreshToken } from "./protocol/refresh.mjs";
import { revokeToken as sendRevocation } from "./protocol/revoke.mjs";
import { requestToken } from "./protocol/request.mjs";
import { verifyIdToken } from "./protocol/verify-id-token.mjs";
import { getUserInfo as requestUserInfo } from "./userinfo/get-user-info.mjs";

export function createEliDClient(options = {}) {
  const config = validateOptions({
    ...options,
    logger: options.logger === undefined ? log : options.logger,
  });
  const loadMetadata = createMetadataLoader(config);
  let jwksUri;
  let keyResolver;

  async function verifiedClaims(idToken, nonce, metadata) {
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
      keyResolver,
    });
  }

  async function completeTokenResponse(response, nonce, metadata, requireIdToken) {
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
    if (!tokens.idToken) return tokens;
    const idTokenClaims = await verifiedClaims(tokens.idToken, nonce, metadata);
    return {
      ...tokens,
      idTokenClaims,
      identity: { issuer: idTokenClaims.iss, subject: idTokenClaims.sub },
    };
  }

  async function exchangeAuthorizationCode(input = {}) {
    const { code, transaction } = validateTransaction(input, config);
    const metadata = await loadMetadata();
    const parameters = {
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: transaction.codeVerifier,
    };
    if (transaction.resource) parameters.resource = transaction.resource;
    const response = await requestToken(config.fetch, config, metadata, parameters);
    const tokens = await completeTokenResponse(response, transaction.nonce, metadata, true);
    config.logger.info("Authorization code exchanged", { operation: "exchangeAuthorizationCode" });
    return tokens;
  }

  async function refreshTokens(input = {}) {
    const { refreshToken, nonce } = input;
    if (config.scopes.includes("openid") && (typeof nonce !== "string" || nonce.length === 0)) {
      throw new ElidClientError(
        "invalid_argument",
        "nonce must match the original authorization transaction.",
      );
    }
    const metadata = await loadMetadata();
    const response = await requestRefreshToken(config.fetch, config, metadata, refreshToken);
    const tokens = await completeTokenResponse(response, nonce, metadata, false);
    config.logger.info("Tokens refreshed", { operation: "refreshTokens" });
    return tokens;
  }

  async function getUserInfo(accessToken, expectedSubject) {
    if (!config.scopes.includes("openid")) {
      throw new ElidClientError(
        "unsupported_provider",
        "UserInfo requires a client configured with the openid scope.",
      );
    }
    const metadata = await loadMetadata();
    const claims = await requestUserInfo(
      config.fetch,
      config,
      metadata,
      accessToken,
      expectedSubject,
    );
    config.logger.info("UserInfo loaded", { operation: "getUserInfo" });
    return claims;
  }

  async function revokeToken(token, tokenTypeHint) {
    const metadata = await loadMetadata();
    await sendRevocation(config.fetch, config, metadata, token, tokenTypeHint);
    config.logger.info("Token revoked", { operation: "revokeToken" });
  }

  async function createRequest() {
    const metadata = await loadMetadata();
    const request = createAuthorizationRequest(config, metadata);
    config.logger.info("Authorization request created", {
      operation: "createAuthorizationRequest",
    });
    return request;
  }

  return Object.freeze({
    discover: async () => structuredClone(await loadMetadata()),
    createAuthorizationRequest: createRequest,
    exchangeAuthorizationCode,
    getUserInfo,
    refreshTokens,
    revokeToken,
  });
}
