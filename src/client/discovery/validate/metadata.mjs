import { ElidClientError } from "../../errors/client-error.mjs";
import { validateCapabilities } from "./capabilities.mjs";
import { validateClientAuthentication } from "./client-authentication.mjs";
import { validateEndpoints } from "./endpoints.mjs";

export function validateMetadata(metadata, issuer) {
  if (metadata.issuer !== issuer) {
    throw new ElidClientError(
      "issuer_mismatch",
      "The discovered issuer does not match configuration.",
    );
  }
  validateEndpoints(metadata);
  const capabilities = validateCapabilities(metadata);
  const authenticationMethods = validateClientAuthentication(metadata);
  return Object.freeze({
    ...metadata,
    ...capabilities,
    token_endpoint_auth_methods_supported: authenticationMethods,
  });
}
