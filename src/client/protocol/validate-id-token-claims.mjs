import { ElidClientError } from "../errors/client-error.mjs";

export function validateIdTokenClaims(
  payload,
  {
    clientId,
    nonce,
    nowSeconds,
    clockToleranceSeconds,
    maxIdTokenAgeSeconds,
    allowMissingNonce = false,
  },
) {
  if (
    typeof payload.sub !== "string" ||
    payload.sub.length === 0 ||
    !Number.isFinite(payload.iat) ||
    !Number.isFinite(payload.exp) ||
    payload.iat > nowSeconds + clockToleranceSeconds ||
    nowSeconds - payload.iat > maxIdTokenAgeSeconds + clockToleranceSeconds
  ) {
    throw new ElidClientError("invalid_id_token", "ID Token identity or time claims are invalid.");
  }
  if (payload.azp !== undefined && (typeof payload.azp !== "string" || payload.azp !== clientId)) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token authorized party does not match the client.",
    );
  }
  if (
    Array.isArray(payload.aud) &&
    payload.aud.length > 1 &&
    (typeof payload.azp !== "string" || payload.azp !== clientId)
  ) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token audience requires a matching authorized party.",
    );
  }
  if ((!allowMissingNonce || payload.nonce !== undefined) && payload.nonce !== nonce) {
    throw new ElidClientError(
      "nonce_mismatch",
      "ID Token nonce does not match the authorization transaction.",
    );
  }
  return payload;
}
