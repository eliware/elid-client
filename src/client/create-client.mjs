import log from "@eliware/log";
import { createAuthorizationRequest } from "./authorization/create/request.mjs";
import { validateTransaction } from "./authorization/validate-transaction.mjs";
import { ElidClientError } from "./errors/client-error.mjs";
import { createMetadataLoader } from "./discovery/create/loader.mjs";
import { validateOptions } from "./options/validate/options.mjs";
import { validateIdentity } from "./options/validate/identity.mjs";
import { createIdTokenVerifier } from "./protocol/id-token-verifier.mjs";
import { createTokenResponseCompleter } from "./protocol/complete-token-response.mjs";
import { requestRefreshToken } from "./protocol/refresh.mjs";
import { revokeToken as sendRevocation } from "./protocol/revoke.mjs";
import { requestToken } from "./protocol/request.mjs";
import { getUserInfo as requestUserInfo } from "./userinfo/get-user-info.mjs";

export function createEliDClient(options = {}) {
  const config = validateOptions({
    ...options,
    logger: options.logger === undefined ? log : options.logger,
  });
  const loadMetadata = createMetadataLoader(config);
  const verifyClaims = createIdTokenVerifier(config);
  const completeTokenResponse = createTokenResponseCompleter(config, verifyClaims);

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
    const tokens = await completeTokenResponse(response, transaction.nonce, metadata, true, false);
    config.logger.info("Authorization code exchanged", { operation: "exchangeAuthorizationCode" });
    return tokens;
  }

  async function refreshTokens(input = {}) {
    const { refreshToken, nonce } = input;
    const identity = validateIdentity(input.identity, config.issuer);
    if (config.scopes.includes("openid") && (typeof nonce !== "string" || nonce.length === 0)) {
      throw new ElidClientError(
        "invalid_argument",
        "nonce must match the original authorization transaction.",
      );
    }
    const metadata = await loadMetadata();
    const response = await requestRefreshToken(config.fetch, config, metadata, refreshToken);
    const tokens = await completeTokenResponse(response, nonce, metadata, false, true, identity);
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
