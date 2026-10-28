import { jwtVerify } from "jose";
import { ElidClientError } from "../errors/client-error.mjs";

export async function verifyIdToken(
  token,
  { clientId, issuer, nonce, algorithms, now, clockToleranceSeconds, keyResolver },
) {
  if (typeof token !== "string" || token.length === 0) {
    throw new ElidClientError("invalid_id_token", "The issuer returned no valid ID Token.");
  }
  let payload;
  try {
    ({ payload } = await jwtVerify(token, keyResolver, {
      issuer,
      audience: clientId,
      algorithms,
      currentDate: new Date(now()),
      clockTolerance: clockToleranceSeconds,
    }));
  } catch {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token signature or standard claims failed validation.",
    );
  }
  const nowSeconds = Math.floor(now() / 1000);
  if (
    typeof payload.sub !== "string" ||
    payload.sub.length === 0 ||
    !Number.isFinite(payload.iat) ||
    !Number.isFinite(payload.exp) ||
    payload.iat > nowSeconds + clockToleranceSeconds
  ) {
    throw new ElidClientError("invalid_id_token", "ID Token identity or time claims are invalid.");
  }
  if (payload.azp !== undefined && payload.azp !== clientId) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token authorized party does not match the client.",
    );
  }
  if (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== clientId) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token audience requires a matching authorized party.",
    );
  }
  if (payload.nonce !== nonce) {
    throw new ElidClientError(
      "nonce_mismatch",
      "ID Token nonce does not match the authorization transaction.",
    );
  }
  return payload;
}
