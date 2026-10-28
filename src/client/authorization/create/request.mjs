import { createHash } from "node:crypto";
import { ElidClientError } from "../../errors/client-error.mjs";
import { createAuthorizationTransaction } from "./transaction.mjs";

export function createAuthorizationRequest(config, metadata) {
  if (
    Array.isArray(metadata.scopes_supported) &&
    config.scopes.some((scope) => !metadata.scopes_supported.includes(scope))
  ) {
    throw new ElidClientError(
      "unsupported_scope",
      "The issuer does not advertise every configured scope.",
    );
  }
  if (config.resource && metadata.resource_parameter_supported !== true) {
    throw new ElidClientError(
      "unsupported_resource",
      "The issuer does not support resource indicators.",
    );
  }
  const transaction = createAuthorizationTransaction(config);
  const codeChallenge = createHash("sha256").update(transaction.codeVerifier).digest("base64url");
  const url = new URL(metadata.authorization_endpoint);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", transaction.state);
  url.searchParams.set("nonce", transaction.nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (config.resource) url.searchParams.set("resource", config.resource);
  return {
    authorizationUrl: url.href,
    transaction,
  };
}
