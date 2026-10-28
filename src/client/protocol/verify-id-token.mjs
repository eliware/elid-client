import { jwtVerify } from "jose";
import { ElidClientError } from "../errors/client-error.mjs";
import { validateIdTokenClaims } from "./validate-id-token-claims.mjs";

export async function verifyIdToken(
  token,
  {
    clientId,
    issuer,
    nonce,
    algorithms,
    now,
    clockToleranceSeconds,
    maxIdTokenAgeSeconds,
    allowMissingNonce = false,
    keyResolver,
  },
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
  return validateIdTokenClaims(payload, {
    clientId,
    nonce,
    nowSeconds: Math.floor(now() / 1000),
    clockToleranceSeconds,
    maxIdTokenAgeSeconds,
    allowMissingNonce,
  });
}
