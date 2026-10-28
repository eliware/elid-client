import { ElidClientError } from "../../errors/client-error.mjs";
import { requestJson } from "../../http/request-json.mjs";
import { validateUrl } from "../../options/validate/url.mjs";

const allowedAlgorithms = new Set([
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
]);

function discoveryUrl(issuerUrl) {
  const path = issuerUrl.pathname.replace(/\/$/, "");
  return new URL(`${path}/.well-known/openid-configuration`, issuerUrl.origin);
}

function validateMetadata(metadata, issuer) {
  if (metadata.issuer !== issuer) {
    throw new ElidClientError(
      "issuer_mismatch",
      "The discovered issuer does not match configuration.",
    );
  }
  for (const key of ["authorization_endpoint", "token_endpoint", "jwks_uri"]) {
    validateUrl(metadata[key], key, { allowLoopbackHttp: true, allowQuery: true });
  }
  if (metadata.userinfo_endpoint !== undefined) {
    validateUrl(metadata.userinfo_endpoint, "userinfo_endpoint", {
      allowLoopbackHttp: true,
      allowQuery: true,
    });
  }
  if (metadata.revocation_endpoint !== undefined) {
    validateUrl(metadata.revocation_endpoint, "revocation_endpoint", {
      allowLoopbackHttp: true,
      allowQuery: true,
    });
  }
  if (
    !Array.isArray(metadata.code_challenge_methods_supported) ||
    !metadata.code_challenge_methods_supported.includes("S256")
  ) {
    throw new ElidClientError("unsupported_provider", "The issuer does not support PKCE S256.");
  }
  if (
    metadata.grant_types_supported &&
    (!Array.isArray(metadata.grant_types_supported) ||
      !metadata.grant_types_supported.includes("authorization_code"))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not support authorization code grants.",
    );
  }
  if (
    metadata.response_types_supported &&
    (!Array.isArray(metadata.response_types_supported) ||
      !metadata.response_types_supported.includes("code"))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not support code responses.",
    );
  }
  const algorithms = metadata.id_token_signing_alg_values_supported;
  if (
    !Array.isArray(algorithms) ||
    !algorithms.some((algorithm) => allowedAlgorithms.has(algorithm))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer has no supported ID Token signing algorithm.",
    );
  }
  if (
    metadata.scopes_supported !== undefined &&
    (!Array.isArray(metadata.scopes_supported) ||
      metadata.scopes_supported.some((scope) => typeof scope !== "string"))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer returned invalid supported scopes.",
    );
  }
  const authMethods = metadata.token_endpoint_auth_methods_supported ?? ["client_secret_basic"];
  if (!Array.isArray(authMethods) || authMethods.some((method) => typeof method !== "string")) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer returned invalid client authentication methods.",
    );
  }
  return Object.freeze({
    ...metadata,
    token_endpoint_auth_methods_supported: Object.freeze([...authMethods]),
    id_token_signing_alg_values_supported: Object.freeze(
      algorithms.filter((algorithm) => allowedAlgorithms.has(algorithm)),
    ),
    ...(metadata.scopes_supported && {
      scopes_supported: Object.freeze([...metadata.scopes_supported]),
    }),
  });
}

export function createMetadataLoader(config) {
  let cache;
  let pending;
  let expiresAt = 0;
  return function loadMetadata() {
    if (cache && config.now() < expiresAt) return Promise.resolve(cache);
    if (pending) return pending;
    pending = (async () => {
      const metadata = await requestJson(config.fetch, discoveryUrl(config.issuerUrl), {
        timeoutMs: config.timeoutMs,
      });
      cache = validateMetadata(metadata, config.issuer);
      expiresAt = config.now() + config.metadataCacheMs;
      config.logger?.info("Issuer metadata loaded", { operation: "discoverIssuer" });
      return cache;
    })();
    return pending.finally(() => {
      pending = undefined;
    });
  };
}
