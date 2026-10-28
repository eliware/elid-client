import { ElidClientError } from "../../errors/client-error.mjs";

const supportedMethods = new Set(["client_secret_basic", "client_secret_post", "none"]);

export function validateClientAuthentication(metadata) {
  const methods = metadata.token_endpoint_auth_methods_supported ?? ["client_secret_basic"];
  if (
    !Array.isArray(methods) ||
    methods.some((method) => typeof method !== "string") ||
    !methods.some((method) => supportedMethods.has(method))
  ) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer advertises no supported client authentication methods.",
    );
  }
  return Object.freeze([...methods]);
}
