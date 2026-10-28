import { ElidClientError } from "../../errors/client-error.mjs";

export function validateIdentity(identity, issuer) {
  if (identity === undefined) return undefined;
  if (
    identity === null ||
    typeof identity !== "object" ||
    identity.issuer !== issuer ||
    typeof identity.subject !== "string" ||
    identity.subject.length === 0
  ) {
    throw new ElidClientError("invalid_argument", "identity must match this client's issuer.");
  }
  return identity;
}
