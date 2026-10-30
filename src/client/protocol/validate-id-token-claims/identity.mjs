import { ElidClientError } from "../../errors/client-error.mjs";

export function validateIdTokenIdentity(
  payload,
  { nowSeconds, clockToleranceSeconds, maxIdTokenAgeSeconds },
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
}
