import { ElidClientError } from "../errors/client-error.mjs";

export function validateTokenResponse(response) {
  if (typeof response.access_token !== "string" || response.access_token.length === 0) {
    throw new ElidClientError("invalid_token_response", "The issuer returned no access token.");
  }
  if (typeof response.token_type !== "string" || response.token_type.toLowerCase() !== "bearer") {
    throw new ElidClientError(
      "invalid_token_response",
      "The issuer returned an unsupported token type.",
    );
  }
  if (response.refresh_token !== undefined && typeof response.refresh_token !== "string") {
    throw new ElidClientError(
      "invalid_token_response",
      "The issuer returned an invalid refresh token.",
    );
  }
  if (response.id_token !== undefined && typeof response.id_token !== "string") {
    throw new ElidClientError("invalid_token_response", "The issuer returned an invalid ID Token.");
  }
  if (
    response.expires_in !== undefined &&
    (!Number.isFinite(response.expires_in) || response.expires_in <= 0)
  ) {
    throw new ElidClientError(
      "invalid_token_response",
      "The issuer returned an invalid token lifetime.",
    );
  }
  if (response.scope !== undefined && typeof response.scope !== "string") {
    throw new ElidClientError(
      "invalid_token_response",
      "The issuer returned an invalid scope value.",
    );
  }
}
