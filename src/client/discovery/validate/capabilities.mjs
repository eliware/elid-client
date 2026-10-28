import { ElidClientError } from "../../errors/client-error.mjs";

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

export function validateCapabilities(metadata) {
  if (
    !Array.isArray(metadata.code_challenge_methods_supported) ||
    !metadata.code_challenge_methods_supported.includes("S256")
  ) {
    throw new ElidClientError("unsupported_provider", "The issuer does not support PKCE S256.");
  }
  if (
    metadata.grant_types_supported !== undefined &&
    (!Array.isArray(metadata.grant_types_supported) ||
      !metadata.grant_types_supported.includes("authorization_code"))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not support authorization code grants.",
    );
  }
  if (
    metadata.response_types_supported !== undefined &&
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
      metadata.scopes_supported.some((scope) => typeof scope !== "string") ||
      new Set(metadata.scopes_supported).size !== metadata.scopes_supported.length)
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer returned invalid supported scopes.",
    );
  }
  return {
    id_token_signing_alg_values_supported: Object.freeze(
      algorithms.filter((algorithm) => allowedAlgorithms.has(algorithm)),
    ),
    ...(metadata.scopes_supported && {
      scopes_supported: Object.freeze([...metadata.scopes_supported]),
    }),
  };
}
